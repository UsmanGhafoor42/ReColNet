"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Brain,
  Film,
  Layers,
  ImageIcon,
  Sparkles,
  Zap,
} from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BeforeAfterSlider } from "@/components/home/before-after-slider";

const features = [
  {
    icon: ImageIcon,
    title: "Image Colorization",
    description:
      "Upload grayscale photos and restore vivid, realistic color with DeOldify and Stable Diffusion ControlNet.",
  },
  {
    icon: Film,
    title: "Video Colorization",
    description:
      "Bring archival film and monochrome footage to life with frame-by-frame AI processing.",
  },
  {
    icon: Brain,
    title: "Explainable AI",
    description:
      "Confidence scores, attention heatmaps, and natural-language explanations for every color choice.",
  },
  {
    icon: Layers,
    title: "Project Workspace",
    description:
      "Save results, track history, reprocess files, and download outputs from one dashboard.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden px-4 pb-20 pt-14 sm:pt-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.67_0.2_282/0.18),transparent_55%)]" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]"
          >
            <div className="text-center lg:text-left">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Professional AI Colorization Studio
              </span>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                Bring grayscale images and video to{" "}
                <span className="bg-linear-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                  cinematic color
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground lg:mx-0">
                ReColNet helps you colorize archive media with explainable AI,
                project history, and downloadable outputs in one responsive workspace.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
                <Link href="/upload" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-7")}>
                  Start Colorizing
                </Link>
                <Link
                  href="#features"
                  className={cn(buttonVariants({ size: "lg", variant: "outline" }), "rounded-full px-7")}
                >
                  Explore Features
                </Link>
              </div>
            </div>
            <div className="relative mx-auto flex w-full max-w-lg items-center justify-center rounded-3xl border border-border/70 bg-card/75 p-8 backdrop-blur">
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-linear-to-br from-primary/10 via-transparent to-violet-500/10" />
              <Image
                src="/Recolnet%20Logo/Recolnet_Logo.png"
                alt="ReColNet logo"
                width={460}
                height={180}
                priority
                className="relative h-auto w-full"
              />
            </div>
          </motion.div>
        </section>

        <section id="features" className="border-t border-border/60 px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold">Core capabilities</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
              Built for studios, archivists, and digital artists who need
              trustworthy, explainable colorization.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full rounded-2xl border-border/70 bg-card/70 backdrop-blur">
                    <CardHeader>
                      <f.icon className="mb-2 h-8 w-8 text-primary" />
                      <CardTitle>{f.title}</CardTitle>
                      <CardDescription>{f.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="demo" className="border-t border-border/60 px-4 py-20">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold">Before & after</h2>
            <p className="mt-3 text-muted-foreground">
              Upload grayscale content and track processing in real-time from your dashboard.
            </p>
            <div className="mt-10">
              <BeforeAfterSlider
                beforeSrc="/before%26after/gray_image.webp"
                afterSrc="/before%26after/colorized_image.png"
                altBefore="Desert landscape in grayscale"
                altAfter="Desert landscape colorized"
              />
            </div>
          </div>
        </section>

        <section id="contact" className="border-t border-border/60 px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold">Get in touch</h2>
            <p className="mt-2 text-muted-foreground">
              Built for modern colorization workflows with reliable, explainable AI.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-primary" />
              ReColNet Team
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
