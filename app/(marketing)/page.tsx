import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { ArrowRight, Clock3, Wallet, Zap } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getMediaOptions } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CompensationDisplay } from "@/components/compensation-display";
import { currencyForCountry, type FxRates } from "@/lib/currency";

const STAT_ICONS = [Wallet, Clock3, Zap];

export default async function HomePage() {
  const db = createServiceRoleClient();
  const [
    { data: cohort },
    { data: sections },
    { data: stats },
    { data: steps },
    { data: faqs },
    { data: rateRows },
    media,
  ] = await Promise.all([
    db.from("cohorts").select("*").eq("is_current", true).single(),
    db.from("page_sections").select("*").eq("is_visible", true),
    db
      .from("stat_items")
      .select("*")
      .eq("is_visible", true)
      .order("position"),
    db
      .from("how_it_works_steps")
      .select("*")
      .eq("is_visible", true)
      .order("position"),
    db.from("faq_items").select("*").eq("is_visible", true).order("position"),
    db.from("fx_rates").select("target_currency, rate"),
    getMediaOptions(),
  ]);

  const mediaById = new Map(media.map((m) => [m.id, m]));
  const cohortImage = cohort?.image_id ? mediaById.get(cohort.image_id) : undefined;

  const sectionMap = new Map((sections ?? []).map((s) => [s.section_key, s]));
  const hero = sectionMap.get("hero");
  const heroImage = hero?.image_id ? mediaById.get(hero.image_id) : undefined;
  const about = sectionMap.get("about");
  const aboutImage = about?.image_id ? mediaById.get(about.image_id) : undefined;

  const hdrs = await headers();
  const country = hdrs.get("x-vercel-ip-country");
  const initialCurrency = currencyForCountry(country);
  const rates: FxRates = Object.fromEntries(
    (rateRows ?? []).map((r) => [r.target_currency, r.rate])
  );

  return (
    <>
      {/* Hero */}
      <section
        className={
          "relative overflow-hidden bg-gradient-to-b from-primary/5 to-background " +
          (heroImage ? "min-h-[600px]" : "")
        }
      >
        {heroImage && (
          <>
            <Image
              src={heroImage.url}
              alt={heroImage.altText ?? ""}
              fill
              priority
              className="object-cover"
            />
            {/* Dark-to-transparent overlay keeps hero text legible over any
                photo, and washes it in the brand color so a literal photo
                still reads as "on-brand" rather than generic stock. */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
            <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
          </>
        )}
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:px-6 sm:py-28">
          <Badge
            variant="secondary"
            className={heroImage ? "bg-white/15 text-white text-xs font-medium backdrop-blur" : "text-xs font-medium"}
          >
            Paid research study &middot; NYC
          </Badge>
          <h1
            className={
              "font-heading max-w-2xl text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl " +
              (heroImage ? "text-white" : "")
            }
          >
            {hero?.title ?? "Show up. Get paid."}
          </h1>
          <p className={heroImage ? "max-w-xl text-lg text-white/85" : "max-w-xl text-lg text-muted-foreground"}>
            {hero?.body}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button render={<Link href="/apply" />} nativeButton={false} size="lg">
              Check if you qualify <ArrowRight />
            </Button>
            <Button
              render={<Link href="#how-it-works" />}
              nativeButton={false}
              size="lg"
              variant="outline"
            >
              How it works
            </Button>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      {stats && stats.length > 0 && (
        <section className="border-y bg-background">
          <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {stats.map((stat, i) => {
              const Icon = STAT_ICONS[i % STAT_ICONS.length];
              return (
                <div
                  key={stat.id}
                  className="flex items-center gap-4 px-6 py-8 sm:justify-center"
                >
                  <Icon className="h-6 w-6 shrink-0 text-primary" />
                  <div>
                    <p className="font-heading text-2xl font-medium">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Current study */}
      {cohort && (
        <section id="study" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Card className="overflow-hidden">
            <div className={cohortImage ? "grid grid-cols-1 md:grid-cols-2" : ""}>
              {cohortImage && (
                <div className="relative min-h-64 md:min-h-full">
                  <Image
                    src={cohortImage.url}
                    alt={cohortImage.altText ?? cohort.study_title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <CardContent className="flex flex-col gap-6 p-8 sm:p-10">
                <Badge variant="outline" className="w-fit text-xs">
                  Current project
                </Badge>
                <h2 className="font-heading text-3xl font-medium sm:text-4xl">
                  {cohort.study_title}
                </h2>
                <p className="max-w-2xl text-muted-foreground">
                  {cohort.study_description}
                </p>
                {cohort.eligibility_notes && (
                  <p className="max-w-2xl text-sm text-muted-foreground">
                    {cohort.eligibility_notes}
                  </p>
                )}
                <div className="flex flex-wrap items-end justify-between gap-6 border-t pt-6">
                  <CompensationDisplay
                    amountUsd={Number(cohort.compensation_usd)}
                    rates={rates}
                    initialCurrency={initialCurrency}
                  />
                  <Button render={<Link href="/apply" />} nativeButton={false} size="lg">
                    Check if you qualify <ArrowRight />
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </section>
      )}

      {/* How it works */}
      {steps && steps.length > 0 && (
        <section
          id="how-it-works"
          className="bg-muted/30 px-4 py-20 sm:px-6"
        >
          <div className="mx-auto max-w-6xl">
            <h2 className="font-heading text-3xl font-medium sm:text-4xl">
              How it works
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col gap-3">
                  <span className="font-heading text-4xl text-primary/40">
                    {String(step.step_number).padStart(2, "0")}
                  </span>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs && faqs.length > 0 && (
        <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="font-heading text-3xl font-medium sm:text-4xl">
            Frequently asked questions
          </h2>
          <Accordion className="mt-8">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      {/* About */}
      {about && (
        <section id="about" className="relative overflow-hidden bg-primary text-primary-foreground">
          {aboutImage && (
            <Image
              src={aboutImage.url}
              alt={aboutImage.altText ?? ""}
              fill
              className="object-cover opacity-20"
            />
          )}
          <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
            <Badge
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground"
            >
              About Dabira Projects
            </Badge>
            <h2 className="font-heading mt-4 text-3xl font-medium sm:text-4xl">
              {about.title}
            </h2>
            <p className="mt-4 text-primary-foreground/80">{about.body}</p>
          </div>
        </section>
      )}
    </>
  );
}
