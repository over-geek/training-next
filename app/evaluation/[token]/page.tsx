"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react"
import { TrainingService } from "@/services/trainings/training-service"
import type { EvaluationTokenVerification, EvaluationResponse } from "@/services/trainings/types"
import { toast } from "sonner"

const EVALUATION_QUESTIONS = [
  "The training met my expectations",
  "I will be able to apply the knowledge learned",
  "The training objectives for each topic were identified and followed",
  "The content was organized and easy to follow",
  "The trainers were knowledgeable",
  "The quality of training was good",
  "Class participation and interactions were encouraged",
  "Adequate time was provided for questions and discussions"
]

const RATING_LABELS = ["Poor", "Fair", "Good", "Excellent"]
const SCALE_LABELS = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]

export default function EvaluationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [isVerifying, setIsVerifying] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [trainingInfo, setTrainingInfo] = useState<EvaluationTokenVerification | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Form data
  const [responses, setResponses] = useState<number[]>(new Array(8).fill(3))
  const [overallRating, setOverallRating] = useState<number>(3)
  const [improvements, setImprovements] = useState<string>("")

  useEffect(() => {
    if (token) {
      verifyToken()
    }
  }, [token])

  const verifyToken = async () => {
    try {
      setIsVerifying(true)
      const verification = await TrainingService.verifyEvaluationToken(token)
      
      if (typeof verification === 'string' && verification === 'Token verified successfully.') {
        setTokenValid(true)
        setTrainingInfo(verification)
      } else {
        setTokenValid(false)
        toast.error('Invalid evaluation token')
      }
    } catch (error) {
      console.error('Failed to verify token:', error)
      setTokenValid(false)
      toast.error('Failed to verify evaluation token. Please check the link and try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleQuestionResponse = (questionIndex: number, value: number) => {
    const newResponses = [...responses]
    newResponses[questionIndex] = value
    setResponses(newResponses)
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      
      const evaluationData: EvaluationResponse = {
        token,
        response: responses[0],
        response2: responses[1],
        response3: responses[2],
        response4: responses[3],
        response5: responses[4],
        response6: responses[5],
        response7: responses[6],
        response8: responses[7],
        response9: overallRating,
        additionalComment: improvements
      }
      await TrainingService.submitEvaluation(evaluationData)
      setIsSubmitted(true)
      toast.success('Thank you! Your evaluation has been submitted successfully.')
    } catch (error) {
      console.error('Failed to submit evaluation:', error)
      toast.error('Failed to submit evaluation. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 0: return "Training Evaluation Form"
      case 1: return "Understanding the Rating Scale"
      case 2: return "Training Assessment"
      case 3: return "Overall Experience"
      default: return "Evaluation"
    }
  }

  const progress = ((currentStep + 1) / 4) * 100

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <h2 className="text-lg font-semibold mb-2">Verifying Access</h2>
            <p className="text-sm text-muted-foreground text-center">
              Please wait while we verify your evaluation link...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Invalid Link</h2>
            <p className="text-sm text-muted-foreground text-center mb-4">
              This evaluation link is invalid or has expired. Please contact your training coordinator for a new link.
            </p>
            <Button onClick={() => router.push('/')}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Thank You!</h2>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Your evaluation has been submitted successfully. Your feedback helps us improve our training programs.
            </p>
            <Button onClick={() => router.push('/')}>
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mb-4">
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground mt-2">
                Step {currentStep + 1} of 4
              </p>
            </div>
            <CardTitle className="text-2xl">{getStepTitle()}</CardTitle>
            {trainingInfo?.trainingName && (
              <p className="text-sm text-muted-foreground">
                Training: {trainingInfo.trainingName}
              </p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Step 0: Introduction */}
            {currentStep === 0 && (
              <div className="text-center space-y-4">
                <p className="text-lg text-muted-foreground">
                  Answer this quick survey to help us improve
                </p>
                <p className="text-sm text-muted-foreground">
                  Your feedback is valuable and will help us enhance future training sessions.
                  This evaluation should take about 3-5 minutes to complete.
                </p>
                <div className="pt-4">
                  <Button onClick={handleNext} className="w-full sm:w-auto">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-muted-foreground mb-6">
                    For the following questions, you'll use a 5-point scale:
                  </p>
                </div>
                
                <div className="bg-muted/50 p-6 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-center">
                    {SCALE_LABELS.map((label, index) => (
                      <div key={index} className="space-y-2">
                        <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-red-500' :
                          index === 1 ? 'bg-orange-500' :
                          index === 2 ? 'bg-yellow-500' :
                          index === 3 ? 'bg-blue-500' : 'bg-green-500'
                        }`}>
                          {index + 1}
                        </div>
                        <p className="text-xs font-medium">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleNext}>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                {EVALUATION_QUESTIONS.map((question, index) => (
                  <div key={index} className="space-y-4">
                    <Label className="text-base font-medium">
                      {index + 1}. {question}
                    </Label>
                    <div className="px-4">
                      <Slider
                        value={[responses[index]]}
                        onValueChange={(value) => handleQuestionResponse(index, value[0])}
                        max={5}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>Strongly Disagree</span>
                        <span className="font-medium">
                          {responses[index]} - {SCALE_LABELS[responses[index] - 1]}
                        </span>
                        <span>Strongly Agree</span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleNext}>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    1. How do you rate the training overall?
                  </Label>
                  <RadioGroup 
                    value={overallRating.toString()} 
                    onValueChange={(value) => setOverallRating(parseInt(value))}
                    className="grid grid-cols-2 gap-4"
                  >
                    {RATING_LABELS.map((label, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={(index + 1).toString()} id={`rating-${index}`} />
                        <Label htmlFor={`rating-${index}`} className="text-sm">
                          {index + 1} - {label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    2. What aspects of the training could be improved?
                  </Label>
                  <Textarea
                    value={improvements}
                    onChange={(e) => setImprovements(e.target.value)}
                    placeholder="Please share your suggestions for improvement..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Evaluation'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
