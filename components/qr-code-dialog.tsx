"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check, Loader2, QrCode, ExternalLink } from "lucide-react"
import { TrainingService } from "@/services/trainings/training-service"
import type { QRCodeData } from "@/services/trainings/types"
import { toast } from "sonner"

interface QRCodeDialogProps {
  isOpen: boolean
  onClose: () => void
  trainingId: number
  trainingName?: string
}

export function QRCodeDialog({ isOpen, onClose, trainingId, trainingName }: QRCodeDialogProps) {
  const [qrData, setQrData] = useState<QRCodeData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (isOpen && trainingId) {
      generateQRCode()
    }
  }, [isOpen, trainingId])

  const generateQRCode = async () => {
    try {
      setIsLoading(true)
      const data = await TrainingService.generateQRCode(trainingId)
      setQrData(data)
    } catch (error) {
      console.error('Failed to generate QR code:', error)
      toast.error('Failed to generate QR code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = async () => {
    if (!qrData?.qrUrl) return

    try {
      await navigator.clipboard.writeText(qrData.qrUrl)
      setIsCopied(true)
      toast.success('Link copied to clipboard!')
      
      // Reset copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast.error('Failed to copy link. Please try again.')
    }
  }

  const handleOpenLink = () => {
    if (qrData?.qrUrl) {
      window.open(qrData.qrUrl, '_blank')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Response QR Code
          </DialogTitle>
          {trainingName && (
            <p className="text-sm text-muted-foreground">
              For: {trainingName}
            </p>
          )}
        </DialogHeader>
        
        <div className="space-y-6">
          {/* QR Code Display */}
          <div className="flex justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 w-64 bg-muted rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">Generating QR code...</p>
              </div>
            ) : qrData ? (
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <img
                  src={`data:image/png;base64,${qrData.qrImage}`}
                  alt="QR Code for Training Response"
                  className="w-64 h-64 object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 w-64 bg-muted rounded-lg">
                <QrCode className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Failed to generate QR code</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generateQRCode}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>

          {/* Link Section */}
          {qrData && (
            <div className="space-y-3">
              <Label htmlFor="response-link">Response Link</Label>
              <div className="flex space-x-2">
                <Input
                  id="response-link"
                  value={qrData.qrUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleOpenLink}
                  className="shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this QR code or link with participants to collect their responses
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {qrData && (
              <Button onClick={generateQRCode} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  'Regenerate QR Code'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
