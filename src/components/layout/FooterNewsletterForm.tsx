"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function FooterNewsletterForm() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex w-full md:w-auto items-center gap-2 max-w-md flex-1"
    >
      <Input
        type="email"
        required
        placeholder="Enter your email address"
        className="bg-neutral-900 border-neutral-700 text-white focus:border-gold placeholder:text-neutral-500 w-full"
        aria-label="Email Address for Newsletter"
      />
      <Button type="submit" variant="primary">
        Subscribe
      </Button>
    </form>
  );
}
