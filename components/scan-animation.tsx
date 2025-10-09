import { DotLottieReact } from "@lottiefiles/dotlottie-react"

interface ScanAnimationProps {
  className?: string
}

export function ScanAnimation({ className }: ScanAnimationProps) {
  return (
    <div className={className}>
      <DotLottieReact
        src="https://lottie.host/5ca6d240-71af-4f4d-ab65-d47bedf4cf86/CIZuC4VNDb.lottie"
        autoplay
        loop
        style={{ height: "200px", width: "200px" }}
      />
      <p className="text-center text-sm text-muted-foreground mt-4">
        Please scan your card...
      </p>
    </div>
  )
}
