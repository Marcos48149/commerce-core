# Admin Dashboard — Catalog Management (Phase 2)

## Purpose

The catalog management module enables admins to manage products, variants, categories, and collections. It provides full CRUD with search, filtering, pagination, and hierarchical category support.

## Requirements

### Requirement: Products List with Search and Pagination

The products list MUST display in a table with columns: image thumbnail, name, SKU, price, stock, status (active/inactive badge), and actions (edit/delete). The list MUST support searching by product name via a search input, filtering by category via a dropdown, and pagination at 20 items per page. Sort columns SHALL be sortable by name, price, stock, and createdAt.

#### Scenario: Products list renders with data

- GIVEN products exist in the store
- WHEN the admin visits `/dashboard/catalog/products`
- THEN a table renders with all columns
- AND pagination controls appear at the bottom

#### Scenario: Search filters products

- GIVEN the products list has 50 products
- WHEN the admin types "remera" in the search input
- THEN only products matching "remera" by name are shown

#### Scenario: Category filter narrows results

- GIVEN products exist across multiple categories
- WHEN the admin selects "Ropa" from the category dropdown
- THEN only products in the "Ropa" category are displayed

### Requirement: Create Product Form

The create product form MUST include fields: name (required), description, SKU (required, unique per store), price (required, decimal), compareAtPrice (optional), categories (multi-select), collections (multi-select), images (URL array), dimensions (width, height, depth), and weight. On submit, the form calls `POST /api/v1/catalog/products` and redirects to the product list.

#### Scenario: Admin creates a product

- GIVEN the admin is on `/dashboard/catalog/products/new`
- WHEN they fill all required fields and submit
- THEN a new product is created via the API
- AND the admin is redirected to the product list showing the new product

#### Scenario: Form validation prevents incomplete submission

- GIVEN the create product form is open
- WHEN the admin clicks submit without a name
- THEN "El nombre es requerido" is shown below the name field
- AND the form is not submitted

### Requirement: Variants Inline Editor

Within the create/edit product form, an inline editor SHALL allow adding, editing, and removing variants. Each variant SHALL have: name, SKU (required, unique per store), price, stock, and compareAtPrice. Stock SHALL be set on the initial variant and create a stock record. Variants are sent as a nested array in the product payload.

#### Scenario: Admin adds variant to product

- GIVEN the admin is creating/editing a product
- WHEN they click "Agregar Variante"
- THEN a new variant row appears with empty fields
- AND they can fill in name, SKU, price, stock

#### Scenario: Admin removes variant

- GIVEN a product has 3 variants
- WHEN the admin clicks the delete icon on one variant
- THEN that variant row is removed from the form
- AND on save, the variant is deleted via API

### Requirement: Edit Product Pre-filled

The edit product form (`/dashboard/catalog/products/:id/edit`) SHALL load existing product data and pre-fill all fields, including variants and category/collection selections. On submit, it calls `PUT /api/v1/catalog/products/:id`.

#### Scenario: Admin edits product price

- GIVEN the admin is on the edit product page
- WHEN they change the price from 1000 to 1200 and submit
- THEN the API updates the product
- AND redirecting to the product list shows the updated price

### Requirement: Delete Product with Confirmation

Deleting a product SHALL show a confirmation dialog with "¿Eliminar producto?" and the product name. On confirm, it calls `DELETE /api/v1/catalog/products/:id`. On success, the product is removed from the list and a success toast appears.

#### Scenario: Admin deletes product

- GIVEN the product list has products
- WHEN the admin clicks the delete action on a product
- THEN a confirm dialog appears with the product name
- WHEN they click "Eliminar"
- THEN the API deletes the product
- AND the product disappears from the list

#### Scenario: Admin cancels deletion

- GIVEN the delete confirmation dialog is open
- WHEN the admin clicks "Cancelar"
- THEN the dialog closes
- AND the product remains in the list

### Requirement: Categories CRUD

Categories MUST be listed in a table with columns: name, slug, parent category, product count, status, actions. Creating a category SHALL require name (required), slug (auto-generated from name, editable), description, and parent (optional, selecting from existing categories). Editing pre-fills and updates via `PUT /api/v1/catalog/categories/:id`. Deleting a category that has children SHALL show a warning: "Esta categoría tiene subcategorías. ¿Eliminar de todas formas?"

#### Scenario: Admin creates category with parent

- GIVEN the admin is on `/dashboard/catalog/categories/new`
- WHEN they enter name "Ropa Deportiva" and select parent "Ropa"
- THEN the category is created with the parent relationship
- AND it appears under "Ropa" in the category tree

#### Scenario: Admin deletes category with children

- GIVEN a category "Ropa" has children
- WHEN the admin tries to delete "Ropa"
- THEN a warning dialog shows "Esta categoría tiene subcategorías. ¿Eliminar de todas formas?"
- AND confirming deletes the category and cascades

### Requirement: Collections CRUD

Collections MUST be listed in a table with columns: image, name, slug, product count, status, actions. Creating a collection SHALL require name, slug (auto-generated), description, and image URL. Editing/Deleting follows the same pattern as categories.

#### Scenario: Admin creates collection

- GIVEN the admin is on `/dashboard/catalog/collections/new`
- WHEN they enter name "Ofertas de Verano" and an image URL
- THEN the collection is created
- AND it appears in the collections list

### Requirement: All Tables Support Sort

All data tables (products, categories, collections) MUST support column sorting. Clicking a sortable column header toggles asc/desc. An arrow icon indicates the current sort direction.

#### Scenario: Admin sorts products by price

- GIVEN the product list has multiple products with different prices
- WHEN the admin clicks the "Precio" column header
- THEN the list sorts ascending by price
- AND clicking again sorts descending

## Routes

| Method | Path | Auth | Permission | Description |
|--------|------|------|------------|-------------|
| GET | /api/v1/catalog/products | AdminJWT | product.read | List products (paginated, search, filter) |
| POST | /api/v1/catalog/products | AdminJWT | product.write | Create product |
| GET | /api/v1/catalog/products/:id | AdminJWT | product.read | Get product with variants |
| PUT | /api/v1/catalog/products/:id | AdminJWT | product.write | Update product |
| DELETE | /api/v1/catalog/products/:id | AdminJWT | product.write | Delete product |
| POST | /api/v1/catalog/products/:id/variants | AdminJWT | product.write | Add variant |
| PUT | /api/v1/catalog/products/:id/variants/:variantId | AdminJWT | product.write | Update variant |
| DELETE | /api/v1/catalog/products/:id/variants/:variantId | AdminJWT | product.write | Delete variant |
| GET | /api/v1/catalog/categories | AdminJWT | category.read | List categories |
| POST | /api/v1/catalog/categories | AdminJWT | category.write | Create category |
| GET | /api/v1/catalog/categories/:id | AdminJWT | category.read | Get category |
| PUT | /api/v1/catalog/categories/:id | AdminJWT | category.write | Update category |
| DELETE | /api/v1/catalog/categories/:id | AdminJWT | category.write | Delete category |
| GET | /api/v1/catalog/collections | AdminJWT | collection.read | List collections |
| POST | /api/v1/catalog/collections | AdminJWT | collection.write | Create collection |
| GET | /api/v1/catalog/collections/:id | AdminJWT | collection.read | Get collection |
| PUT | /api/v1/catalog/collections/:id | AdminJWT | collection.write | Update collection |
| DELETE | /api/v1/catalog/collections/:id | AdminJWT | collection.write | Delete collection |
