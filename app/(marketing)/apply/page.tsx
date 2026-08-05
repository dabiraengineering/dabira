"use client";

import { useActionState, useState } from "react";
import { submitApplication } from "@/lib/actions/leads";
import { initialActionState } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const REFERRAL_OPTIONS = [
  { value: "friend", label: "Friend or family" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "flyer", label: "A flyer" },
  { value: "other", label: "Other" },
];

export default function ApplyPage() {
  const [state, formAction, isPending] = useActionState(
    submitApplication,
    initialActionState
  );
  const [referral, setReferral] = useState("");

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl font-medium">
            Check if you qualify
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Answer a few quick questions to see if you&apos;re eligible.
            Takes about 2 minutes.
          </p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" name="age" type="number" min={18} max={120} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" name="phone" type="tel" required />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>

            <div className="flex items-start gap-2">
              <Checkbox id="smsConsent" name="smsConsent" className="mt-0.5" />
              <Label
                htmlFor="smsConsent"
                className="text-xs font-normal leading-relaxed text-muted-foreground"
              >
                Yes, I&apos;d like to receive SMS updates about my application
                status from Dabira Projects, including confirmations,
                reminders, and follow-up notices. Message frequency varies.
                Msg &amp; data rates may apply. Reply HELP for help or STOP to
                opt out.
              </Label>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Availability for a one-day session this month</Label>
              <RadioGroup
                name="availability"
                defaultValue="first_half"
                className="flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="first_half" id="first_half" />
                  <Label htmlFor="first_half" className="font-normal">
                    First half of the month (1st&ndash;15th)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="second_half" id="second_half" />
                  <Label htmlFor="second_half" className="font-normal">
                    Second half of the month (16th&ndash;31st)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Are you comfortable reading and writing in English?</Label>
              <RadioGroup
                name="englishComfort"
                defaultValue="yes"
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="comfort_yes" />
                  <Label htmlFor="comfort_yes" className="font-normal">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="somewhat" id="comfort_somewhat" />
                  <Label htmlFor="comfort_somewhat" className="font-normal">
                    Somewhat
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="comfort_no" />
                  <Label htmlFor="comfort_no" className="font-normal">
                    No
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="referralSource">How did you hear about us?</Label>
              <Select
                name="referralSource"
                value={referral}
                onValueChange={(value) => setReferral(value ?? "")}
              >
                <SelectTrigger id="referralSource" className="w-full">
                  <SelectValue placeholder="Select one" />
                </SelectTrigger>
                <SelectContent>
                  {REFERRAL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {referral === "other" && (
                <Input
                  name="referralDetails"
                  placeholder="Tell us more"
                  className="mt-1"
                />
              )}
            </div>

            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
