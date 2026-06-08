"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  Film,
  ImageIcon,
  Sparkles,
  Wand2,
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
    icon: Wand2,
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
        <section className="relative overflow-hidden px-4 pb-24 pt-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.55_0.22_285/0.18),transparent_55%)]" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative mx-auto max-w-4xl text-center"
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Universal AI Colorization Studio
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Transform grayscale into{" "}
              <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                living color
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              ReColNet colorizes historical archives, sketches, and film with
              state-of-the-art deep learning—and explains every decision with
              visual reasoning maps.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/upload" className={cn(buttonVariants({ size: "lg" }))}>
                Start colorizing — free
              </Link>
              <Link
                href="#demo"
                className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
              >
                View demo
              </Link>
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
                  <Card className="h-full border-border/80 bg-card/60 backdrop-blur">
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
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold">Before & after</h2>
            <p className="mt-3 text-muted-foreground">
              AI colorization pipeline (Phase 2) will power live previews here.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="flex aspect-video items-center justify-center bg-muted/50 text-muted-foreground">
                  Original (grayscale)
                </CardContent>
              </Card>
              <Card className="border-primary/30">
                <CardContent className="flex aspect-video items-center justify-center bg-primary/5 text-primary">
                  Colorized preview
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="contact" className="border-t border-border/60 px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold">Get in touch</h2>
            <p className="mt-2 text-muted-foreground">
              Final Year Project — ReColNet Team
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
