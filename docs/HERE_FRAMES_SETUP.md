# Here Frames Setup

The HomePage now includes a new "Visual Journey" hero section that plays animated frames from the `public/here-frames/` directory.

## Setup Instructions

1. **Prepare your frame images**: Gather all your hero frame images in a single directory (e.g., `/path/to/your/frames/`)

2. **Copy frames to project**:
   ```bash
   npm run install:here-frames /path/to/your/frames/
   ```

   This will:
   - Copy all `.jpg`, `.jpeg`, and `.png` files from your source directory
   - Rename them to `frame-001.jpg`, `frame-002.jpg`, etc.
   - Place them in `public/here-frames/`

3. **Run development server**:
   ```bash
   npm run dev
   ```

The hero section will automatically load and animate the frames at 24 FPS.

## Frame Specifications

- **Format**: JPG or PNG images
- **Naming**: Files should be named in order (they'll be sorted naturally)
- **Quantity**: The code supports up to 152 frames (configurable via `FRAME_SEQUENCE_TOTAL`)
- **Resolution**: Recommended minimum 1920x1080px for best quality

## How It Works

The new hero section appears between the error banner and the "Live Reading Analytics" section. It includes:
- Full-viewport animated canvas showing frame-by-frame motion
- Gradient overlay for text readability
- Loading state indicator
- Responsive design for mobile and desktop
- Automatic resizing on window change

## Customization

To customize the hero text or styling, edit the JSX in `pages/HomePage.tsx` around the "NEW HERE HERO SECTION" comment.
