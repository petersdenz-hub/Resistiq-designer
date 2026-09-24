import { DesignProvider } from '@/design/DesignProvider'
import { Studio } from '@/studio/Studio'

export default function App() {
  return (
    <DesignProvider>
      <Studio />
    </DesignProvider>
  )
}
