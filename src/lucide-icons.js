// Lucide entry — only the icons actually used on the site get bundled.
// The icons map must match the data-lucide names (PascalCase keys).
// Build: npm run build:icons  →  assets/library/lucide/lucide.min.js
import {
    createIcons,
    ArrowUpRight,
    Download,
    Mail,
    Maximize2,
    X,
    ChevronLeft,
    ChevronRight,
    Send
} from 'lucide';

createIcons({
    icons: {
        ArrowUpRight,
        Download,
        Mail,
        Maximize2,
        X,
        ChevronLeft,
        ChevronRight,
        Send
    }
});
