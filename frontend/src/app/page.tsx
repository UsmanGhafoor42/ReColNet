"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Film, ImageIcon, Sparkles, Zap } from "lucide-react";

import { BeforeAfterSlider } from "@/components/home/before-after-slider";
import { TeamSection } from "@/components/home/team-section";
import { SiteHeader } from "@/components/layout/site-header";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const trustItems = [
  "AI powered",
  "Fast processing",
  "High resolution",
  "Privacy first",
];

const features = [
  {
    icon: Sparkles,
    title: "Smart color prediction",
    description:
      "AI identifies faces, clothing, skies, vegetation, and architecture to apply realistic colors.",
  },
  {
    icon: ImageIcon,
    title: "Historical restoration",
    description:
      "Restore family memories and archive photos in seconds with natural, believable tones.",
  },
  {
    icon: Zap,
    title: "High resolution output",
    description:
      "Download sharp, detailed colorized images ready for printing or sharing.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="px-4 pb-16 pt-12 sm:pb-24 sm:pt-16">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-[3.25rem]">
                Bring black &amp; white photos back to life
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
                Transform old grayscale images into realistic color photographs
                using advanced AI restoration technology.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                <Link
                  href="/upload"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "rounded-full px-8",
                  )}
                >
                  Upload Photo
                </Link>
                <Link
                  href="#demo"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "rounded-full px-8",
                  )}
                >
                  See examples
                </Link>
              </div>

              <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3 lg:justify-start">
                {trustItems.map((label) => (
                  <li
                    key={label}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="h-4 w-4 text-brand" strokeWidth={2.5} />
                    {label}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              id="demo"
            >
              <BeforeAfterSlider
                beforeSrc="/before%26after/gray_image.webp"
                afterSrc="/before%26after/colorized_image.png"
                altBefore="Desert landscape in grayscale"
                altAfter="Desert landscape colorized"
                variant="hero"
              />
            </motion.div>
          </div>
        </section>

        {/* Examples */}
        <section className="border-t border-border px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold">Real colorization results</h2>
              <p className="mt-3 text-muted-foreground">
                Drag each slider to compare before and after. Trust comes from
                seeing realistic output — not marketing copy.
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Landscapes",
                  before: "/before%26after/lanscape.avif",
                  after: "/before%26after/lanscape-colorized.png",
                  alt: "Landscape",
                },
                {
                  title: "Historical photos",
                  before: "/before%26after/historicalPlace.jpg",
                  after: "/before%26after/historicalPlace-colorized.png",
                  alt: "Historical place",
                },
              ].map((ex) => (
                <div key={ex.title}>
                  <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                    {ex.title}
                  </h3>
                  <BeforeAfterSlider
                    beforeSrc={ex.before}
                    afterSrc={ex.after}
                    altBefore={`${ex.alt} — before`}
                    altAfter={`${ex.alt} — after`}
                    variant="compact"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-border px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold">Built for real restoration</h2>
              <p className="mt-3 text-muted-foreground">
                Premium colorization for portraits, archives, and family
                memories — not oversaturated AI effects.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="premium-card h-full border-border bg-card">
                    <CardHeader>
                      <f.icon className="mb-2 h-6 w-6 text-brand" />
                      <CardTitle className="text-lg">{f.title}</CardTitle>
                      <CardDescription className="leading-relaxed">
                        {f.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Video */}
        <section className="border-t border-border bg-muted/40 px-4 py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <Film className="h-3.5 w-3.5 text-brand" />
                Video colorization
              </div>
              <h2 className="text-3xl font-bold">Colorize video footage</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Upload grayscale clips and get full-frame colorized video with
                synced playback, download, and reprocess — a rare capability
                among colorization tools.
              </p>
              <Link
                href="/upload"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "mt-6 rounded-full",
                )}
              >
                Try video upload
              </Link>
            </div>
            <div className="premium-card overflow-hidden p-2">
              <BeforeAfterSlider
                beforeSrc="/before%26after/bird.avif"
                afterSrc="/before%26after/bird_colorized.png"
                altBefore="Bird in grayscale"
                altAfter="Bird colorized"
                variant="compact"
              />
              <p className="px-3 pb-2 pt-1 text-center text-xs text-muted-foreground">
                Drag the slider to compare — same workflow for photos and video
              </p>
            </div>
          </div>
        </section>

        <TeamSection />

        {/* CTA */}
        <section className="border-t border-border px-4 py-20">
          <div className="premium-card mx-auto max-w-3xl px-6 py-12 text-center sm:px-10">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Ready to restore your memories?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Upload a grayscale photo or video and see realistic color in
              seconds. Your files stay private to your workspace.
            </p>
            <Link
              href="/upload"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-8 rounded-full px-8",
              )}
            >
              Upload Photo
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-8">
        <p className="text-center text-sm text-muted-foreground">
          ReColNet — AI image &amp; video colorization
        </p>
      </footer>
    </div>
  );
}
