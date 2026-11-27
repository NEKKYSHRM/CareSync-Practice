
from math import ceil
from typing import Any, Generic, TypeVar

from fastapi import HTTPException, Query
from odmantic import AIOEngine
from pydantic import BaseModel


T = TypeVar("T")

ALLOWED_PAGE_SIZES = (5, 10, 25, 50, 100)
DEFAULT_PAGE_SIZE = 10


class PaginationParams(BaseModel):
    page: int = 1
    page_size: int = DEFAULT_PAGE_SIZE

    @property
    def skip(self) -> int:
        return (self.page - 1) * self.page_size


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    page: int
    page_size: int
    total_items: int
    total_pages: int
    has_next: bool
    has_previous: bool


def get_pagination_params(
    page: int = Query(1, ge=1),
    page_size: int = Query(DEFAULT_PAGE_SIZE),
) -> PaginationParams:
    """Validate and build shared pagination parameters."""

    if page_size not in ALLOWED_PAGE_SIZES:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Invalid page size.",
                "allowed_page_sizes": list(ALLOWED_PAGE_SIZES),
            },
        )

    return PaginationParams(
        page=page,
        page_size=page_size,
    )


async def paginate(
    engine: AIOEngine,
    model: type,
    pagination: PaginationParams,
    *queries: Any,
    sort: Any = None,
) -> PaginatedResponse:
    """Fetch one page, count matching records, and apply sorting."""

    total_items = await engine.count(model, *queries)

    find_kwargs = {
        "skip": pagination.skip,
        "limit": pagination.page_size,
    }

    if sort is not None:
        find_kwargs["sort"] = sort

    items = await engine.find(
        model,
        *queries,
        **find_kwargs,
    )

    total_pages = ceil(total_items / pagination.page_size)

    return PaginatedResponse(
        items=items,
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total_items,
        total_pages=total_pages,
        has_next=pagination.page < total_pages,
        has_previous=pagination.page > 1 and total_pages > 0,
    )
