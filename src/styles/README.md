This Grids System is extracted from MDL.
Need to be refined.

--------------------

## Introduction

The Material Design Lite (MDL) **grid** component is a simplified method for laying out content for multiple screen sizes. It reduces the usual coding burden required to correctly display blocks of content in a variety of display conditions.

The MDL grid is defined and enclosed by a container element. A grid has 12 columns in the desktop screen size, 8 in the tablet size, and 4 in the phone size, each size having predefined margins and gutters. cols are laid out sequentially in a row, in the order they are defined, with some exceptions:

- If a col doesn't fit in the row in one of the screen sizes, it flows into the following line.
- If a col has a specified column size equal to or larger than the number of columns for the current screen size, it takes up the entirety of its row.

You can set a maximum grid width, after which the grid stays centered with padding on either side, by setting its `max-width` CSS property.

Grids are a fairly new and non-standardized feature in most user interfaces, and provide users with a way to view content in an organized manner that might otherwise be difficult to understand or retain. Their design and use is an important factor in the overall user experience.

## Configuration options

The MDL CSS classes apply various predefined visual enhancements and behavioral effects to the grid. The table below lists the available classes and their effects.

| MDL class | Effect | Remarks |
|-----------|--------|---------|
| `grid` | Defines a container as an MDL grid component | Required on "outer" div element |
| `col` | Defines a container as an MDL col | Required on "inner" div elements |
| `grid-no-spacing` | Modifies the grid cols to have no margin between them. | Optional on grid container. |
| `col-N` | Sets the column size for the col to N | N is 1-12 inclusive, defaults to 4; optional on "inner" div elements|
| `col-N-desktop` | Sets the column size for the col to N in desktop mode only | N is 1-12 inclusive; optional on "inner" div elements|
| `col-N-tablet` | Sets the column size for the col to N in tablet mode only | N is 1-8 inclusive; optional on "inner" div elements|
| `col-N-phone` | Sets the column size for the col to N in phone mode only | N is 1-4 inclusive; optional on "inner" div elements|
| `col-N-offset` | Adds N columns of whitespace before the col | N is 1-11 inclusive; optional on "inner" div elements|
| `col-N-offset-desktop` | Adds N columns of whitespace before the col in desktop mode | N is 1-11 inclusive; optional on "inner" div elements|
| `col-N-offset-tablet` | Adds N columns of whitespace before the col in tablet mode | N is 1-7 inclusive; optional on "inner" div elements|
| `col-N-offset-phone` | Adds N columns of whitespace before the col in phone mode | N is 1-3 inclusive; optional on "inner" div elements|
| `col-order-N` | Reorders col to position N | N is 1-12 inclusive; optional on "inner" div elements|
| `col-order-N-desktop` | Reorders col to position N when in desktop mode | N is 1-12 inclusive; optional on "inner" div elements|
| `col-order-N-tablet` | Reorders col to position N when in tablet mode | N is 1-12 inclusive; optional on "inner" div elements|
| `col-order-N-phone` | Reorders col to position N when in phone mode | N is 1-12 inclusive; optional on "inner" div elements|
| `col-hide-desktop` | Hides the col when in desktop mode | Optional on "inner" div elements |
| `col-hide-tablet` | Hides the col when in tablet mode | Optional on "inner" div elements |
| `col-hide-phone` | Hides the col when in phone mode | Optional on "inner" div elements |
| `col-stretch` | Stretches the col vertically to fill the parent | Default; optional on "inner" div elements |
| `col-top` | Aligns the col to the top of the parent | Optional on "inner" div elements |
| `col-middle` | Aligns the col to the middle of the parent | Optional on "inner" div elements |
|`col-bottom` | Aligns the col to the bottom of the parent | Optional on "inner" div elements |