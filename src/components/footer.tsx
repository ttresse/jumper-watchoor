import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border py-6 text-center">
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Data provided by LiFi API
          </p>
          <p className="text-xs text-muted-foreground">
            This is an unofficial Jumper application
          </p>
        </div>
        <a
          href="https://github.com/ttresse/jumper-watchoor"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-muted-foreground hover:text-foreground transition-colors"
        >
          <Github className="h-5 w-5" />
        </a>
      </div>
    </footer>
  );
}
