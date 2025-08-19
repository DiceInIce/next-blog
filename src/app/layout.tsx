import { Provider } from "@/components/ui/provider"
import { HydrationSafe } from "@/components/ui/hydration-safe"

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  return (
    <html suppressHydrationWarning>
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
