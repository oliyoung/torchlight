# SVG Court System Guide

## Overview

The whiteboard feature now uses SVG files for court backgrounds instead of hardcoded Three.js geometry. This approach provides several key benefits:

- ✅ **Easy Editing**: Courts can be modified in any SVG editor (Figma, Illustrator, Inkscape)
- ✅ **Version Control**: SVG files can be tracked and diffed in git
- ✅ **Designer Friendly**: Non-developers can create and modify courts
- ✅ **Scalable Graphics**: SVG provides crisp rendering at any zoom level
- ✅ **Complex Designs**: Support for gradients, patterns, and intricate markings
- ✅ **Rapid Prototyping**: New sports/courts can be added quickly

## Available Court Types

### Basketball Courts
- **`basketball-full.svg`** - Full NBA/FIBA court with paint, three-point lines, free throw circles
- **`basketball-half.svg`** - Half court for training drills and small-sided games

### Soccer/Football Fields
- **`soccer-full.svg`** - Full FIFA regulation field with penalty areas, center circle, corner arcs
- **`soccer-half.svg`** - Half field for training and small-sided games

### Other Sports
- **`tennis.svg`** - Tennis court with service boxes, baselines, net
- **`volleyball.svg`** - Beach/indoor volleyball court with attack lines, service areas

## SVG Specifications

### Coordinate System
All SVG files use a consistent coordinate system that maps to Three.js world space:

```typescript
// SVG viewBox → Three.js coordinates
// SVG coordinates are converted via scaling factor
scale: 0.01 // Most common scale for court SVGs
```

### Required Elements
Each court SVG should include:

1. **Court Surface** - Background rectangle with appropriate color
2. **Boundary Lines** - White court boundaries
3. **Sport-Specific Markings** - Lines, circles, boxes specific to the sport
4. **Goals/Baskets/Nets** - Colored differently (typically orange/red)

### Design Guidelines

#### Colors
- **Court Surface**: Use appropriate sport colors
  - Basketball: `#8B4513` (brown)
  - Soccer: `#228B22` (green)
  - Tennis: `#4682B4` (blue)
  - Volleyball: `#DEB887` (sand)
- **Lines**: `#ffffff` (white) with 4-8px stroke width
- **Special Elements**: `#FF6600` (orange) for baskets, goals

#### Dimensions
- Use realistic proportions for each sport
- Design for 16:10 aspect ratio when possible
- Include proper margins/borders around playing area

#### Structure
```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg width="1600" height="1000" viewBox="0 0 1600 1000" xmlns="http://www.w3.org/2000/svg">
  <!-- Court Surface -->
  <rect width="1600" height="1000" fill="#courtColor" />

  <!-- Boundary Lines -->
  <rect fill="none" stroke="#ffffff" stroke-width="8" />

  <!-- Sport-Specific Markings -->
  <!-- ... -->
</svg>
```

## Creating Custom Courts

### Method 1: SVG Editor (Recommended)
1. **Open Template**: Start with an existing court SVG as a template
2. **Design Tool**: Use Figma, Adobe Illustrator, or free Inkscape
3. **Edit Elements**: Modify lines, add markings, change colors
4. **Export**: Save as optimized SVG
5. **Test**: Place in `/public/courts/` and update component

### Method 2: Code-Based
1. **Create File**: New SVG file in `/public/courts/your-court.svg`
2. **Define Structure**: Add viewBox, court surface, boundaries
3. **Add Markings**: Use `<line>`, `<circle>`, `<rect>`, `<path>` elements
4. **Optimize**: Remove unnecessary attributes and whitespace

### Example: Custom Training Court
```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <!-- Square training court -->
  <rect width="800" height="800" fill="#228B22" />
  <rect x="50" y="50" width="700" height="700" fill="none" stroke="#ffffff" stroke-width="6" />

  <!-- Center circle -->
  <circle cx="400" cy="400" r="100" fill="none" stroke="#ffffff" stroke-width="4" />

  <!-- Training zones -->
  <line x1="50" y1="400" x2="750" y2="400" stroke="#ffffff" stroke-width="4" />
  <line x1="400" y1="50" x2="400" y2="750" stroke="#ffffff" stroke-width="4" />
</svg>
```

## Adding New Court Types

### 1. Create SVG File
Place your SVG in `/public/courts/new-court.svg`

### 2. Update Component
Add the new court type to `CourtBackground` component:

```typescript
// In components/whiteboard/court-background.tsx
case "NEW_COURT_TYPE":
  return {
    svgPath: "/courts/new-court.svg",
    scale: 0.01,
    courtDimensions: { width: 12, height: 8 }
  };
```

### 3. Update Types
Add to the `CourtType` enum in `lib/types.ts`:

```typescript
export type CourtType =
  | "BASKETBALL_FULL"
  | "BASKETBALL_HALF"
  | "SOCCER_FULL"
  | "SOCCER_HALF"
  | "TENNIS"
  | "VOLLEYBALL"
  | "FOOTBALL_FULL"
  | "NEW_COURT_TYPE"; // Add your new type
```

### 4. Update Database Schema
If needed, add to the court type constraints in database migrations.

## Performance Considerations

### SVG Optimization
- **Remove Metadata**: Strip editor-specific data
- **Minimize Paths**: Use simple shapes when possible
- **Combine Elements**: Merge similar stroke styles
- **Optimize Numbers**: Round coordinates to reasonable precision

### Three.js Integration
- **Caching**: SVGs are loaded once and cached by React Three Fiber
- **Fallback**: Simple geometric fallback ensures performance on slower devices
- **Lazy Loading**: SVGs load asynchronously with Suspense boundaries

## Troubleshooting

### SVG Not Displaying
1. **Check File Path**: Ensure SVG is in `/public/courts/`
2. **Validate SVG**: Use online SVG validator
3. **Check Scale**: Adjust scale factor if too small/large
4. **Browser Console**: Look for loading errors

### Positioning Issues
1. **ViewBox**: Ensure proper viewBox dimensions
2. **Coordinate System**: Remember Y-axis is flipped in Three.js
3. **Rotation**: SVG is rotated -90° to lay flat on ground plane

### Performance Issues
1. **File Size**: Optimize SVG file size (target <50KB)
2. **Complexity**: Reduce number of path elements
3. **Fallback**: Ensure fallback court renders quickly

## Future Enhancements

### Planned Features
- [ ] **Court Editor UI**: In-browser court editing tool
- [ ] **Template Library**: Pre-built courts for various sports levels
- [ ] **Dynamic Markings**: Adjustable court dimensions
- [ ] **Animation Support**: Animated court elements
- [ ] **User Uploads**: Allow coaches to upload custom courts

### Contributing Courts
We welcome contributions of new court types! Please:
1. Follow the design guidelines above
2. Test in the whiteboard demo
3. Submit as pull request with documentation
4. Include sport-specific notes for accuracy

## Examples in Action

Visit `/whiteboard` in your browser to see:
- **Basketball Full Court**: Complete NBA-style court with all markings
- **Interactive Elements**: Court scales and rotates with camera
- **Fallback Rendering**: Graceful degradation if SVG fails to load
- **Performance**: Smooth 60fps animation over detailed court graphics

The SVG court system provides a perfect balance of visual fidelity, performance, and maintainability for the tactical whiteboard feature.