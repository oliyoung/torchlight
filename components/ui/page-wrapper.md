# PageWrapper Component

The `PageWrapper` component provides consistent layout and styling for all internal pages in the coaching platform. It handles page animations, responsive layout, headers, breadcrumbs, and action buttons.

## Basic Usage

```tsx
import { PageWrapper } from "@/components/ui/page-wrapper";

export default function MyPage() {
  return (
    <PageWrapper
      title="Page Title"
      description="Optional page description"
    >
      {/* Your page content */}
    </PageWrapper>
  );
}
```

## With Actions and Breadcrumbs

```tsx
import { PageWrapper } from "@/components/ui/page-wrapper";
import { Button } from "@/components/ui/button";

export default function MyPage() {
  return (
    <PageWrapper
      title="Athletes"
      description="Manage your athletes"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Athletes", href: "/athletes" }
      ]}
      actions={
        <Button>Add New</Button>
      }
    >
      {/* Your page content */}
    </PageWrapper>
  );
}
```

## Helper Components

### PageSection
For organizing content into sections:

```tsx
import { PageWrapper, PageSection } from "@/components/ui/page-wrapper";

<PageWrapper title="Dashboard">
  <PageSection
    title="Recent Sessions"
    description="Your latest coaching sessions"
    actions={<Button size="sm">View All</Button>}
  >
    {/* Section content */}
  </PageSection>
</PageWrapper>
```

### PageCard
For card-based layouts:

```tsx
import { PageCard } from "@/components/ui/page-wrapper";

<PageCard>
  <h3>Card Title</h3>
  <p>Card content</p>
</PageCard>
```

### PageGrid
For responsive grid layouts:

```tsx
import { PageGrid, PageCard } from "@/components/ui/page-wrapper";

<PageGrid columns={3}>
  <PageCard>Item 1</PageCard>
  <PageCard>Item 2</PageCard>
  <PageCard>Item 3</PageCard>
</PageGrid>
```

## Props

### PageWrapper Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | - | Page title (h1) |
| description | string | - | Page description |
| actions | ReactNode | - | Action buttons/controls |
| breadcrumbs | BreadcrumbItemType[] | - | Array of breadcrumb items with label and href |
| fullWidth | boolean | false | Disable container constraints |
| noPadding | boolean | false | Remove default padding |
| className | string | - | Additional CSS classes |

### PageGrid Columns

- `1`: Single column
- `2`: 1 column on mobile, 2 on desktop
- `3`: 1 column on mobile, 2 on tablet, 3 on desktop
- `4`: 1 column on mobile, 2 on tablet, 4 on desktop

## Design Principles

1. **Consistent Spacing**: Automatic responsive padding and margins
2. **Smooth Animations**: Framer Motion page transitions
3. **Mobile-First**: Responsive breakpoints for all screen sizes
4. **Accessibility**: Semantic HTML structure with proper headings
5. **Flexibility**: Optional props for different page layouts