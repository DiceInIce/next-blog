import type { Metadata } from "next"
import { Provider } from "@/components/ui/provider"
import { HydrationSafe } from "@/components/ui/hydration-safe"

export const metadata: Metadata = {
  title: "Черновик",
  description: "Черновик — минималистичный блог для быстрых заметок и публикаций.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo-light.svg", media: "(prefers-color-scheme: light)" },
      { url: "/logo-dark.svg", media: "(prefers-color-scheme: dark)" }
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg"
  }
}

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <Provider>
          <HydrationSafe>
            {children}
          </HydrationSafe>
        </Provider>
      </body>
    </html>
  )
}
