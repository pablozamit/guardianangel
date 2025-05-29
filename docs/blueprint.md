# **App Name**: Guardian Angel

## Core Features:

- Content Detection: Periodically analyzes screenshots using a local TensorFlow Lite model to detect adult content. This runs in the background as a tool.
- Guardian Configuration: Allows the user to configure a 'guardian' email address. This email will receive notifications upon detection of inappropriate content or attempted tampering.
- Content Alert: Sends an email notification to the configured guardian email upon detection of inappropriate content.
- Tamper Detection: Detects attempts to uninstall or bypass the app's monitoring. Sends a notification to the guardian email if such attempts are detected.
- Dashboard UI: Presents a minimalistic UI to display basic stats, such as the number of blocked attempts. Provides access to the (limited) settings.
- Content Blocking: Implements an immediate blocking overlay upon detection of inappropriate content. Prevents further access until cleared.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to convey trust and security. This should feature prominently in buttons and key UI elements.
- Background color: Very light blue-gray (#F0F4F7) for a clean and unobtrusive backdrop. Provides a neutral base to avoid distractions.
- Accent color: Soft purple (#9575CD) to highlight interactive elements and alerts. This adds a touch of sophistication and visual interest.
- Clean, sans-serif font for all text. Focus on readability and clarity.
- Simple, geometric icons for navigation and alerts. Prioritize clarity and ease of understanding.
- Minimalist design with a focus on clear information hierarchy. Avoid clutter to ensure ease of use.