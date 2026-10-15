"use client";

import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Code2,
  Heading2,
  Heading3,
  Heading4,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { isSafeHref, isSafeImageSrc } from "@/lib/cms/document";
import { cn } from "@/lib/utils";
import { controlClass } from "../field";

type Panel = "link" | "image" | null;

export function Toolbar({ editor }: { editor: Editor }) {
  const [panel, setPanel] = useState<Panel>(null);

  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      paragraph: editor.isActive("paragraph"),
      h2: editor.isActive("heading", { level: 2 }),
      h3: editor.isActive("heading", { level: 3 }),
      h4: editor.isActive("heading", { level: 4 }),
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      strike: editor.isActive("strike"),
      code: editor.isActive("code"),
      link: editor.isActive("link"),
      linkHref: (editor.getAttributes("link").href as string | undefined) ?? "",
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      blockquote: editor.isActive("blockquote"),
      codeBlock: editor.isActive("codeBlock"),
      alignLeft: editor.isActive({ textAlign: "left" }),
      alignCenter: editor.isActive({ textAlign: "center" }),
      alignRight: editor.isActive({ textAlign: "right" }),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  });

  const chain = () => editor.chain().focus();

  return (
    // Sticks just below the editor's action bar (4rem tall).
    <div className="sticky top-[calc(var(--cms-top)+4.375rem)] z-20 border-b border-cms-field bg-white/95 backdrop-blur">
      <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5 px-2 py-1.5">
        <Tool icon={Undo2} label="Undo" shortcut="Mod+Z" disabled={!state.canUndo} onClick={() => chain().undo().run()} />
        <Tool icon={Redo2} label="Redo" shortcut="Mod+Shift+Z" disabled={!state.canRedo} onClick={() => chain().redo().run()} />
        <Divider />
        <Tool icon={Pilcrow} label="Paragraph" active={state.paragraph} onClick={() => chain().setParagraph().run()} />
        <Tool icon={Heading2} label="Heading 2" active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()} />
        <Tool icon={Heading3} label="Heading 3" active={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()} />
        <Tool icon={Heading4} label="Heading 4" active={state.h4} onClick={() => chain().toggleHeading({ level: 4 }).run()} />
        <Divider />
        <Tool icon={Bold} label="Bold" shortcut="Mod+B" active={state.bold} onClick={() => chain().toggleBold().run()} />
        <Tool icon={Italic} label="Italic" shortcut="Mod+I" active={state.italic} onClick={() => chain().toggleItalic().run()} />
        <Tool icon={Underline} label="Underline" shortcut="Mod+U" active={state.underline} onClick={() => chain().toggleUnderline().run()} />
        <Tool icon={Strikethrough} label="Strikethrough" active={state.strike} onClick={() => chain().toggleStrike().run()} />
        <Tool icon={Code} label="Inline code" active={state.code} onClick={() => chain().toggleCode().run()} />
        <Tool icon={Link2} label="Link" active={state.link || panel === "link"} onClick={() => setPanel(panel === "link" ? null : "link")} />
        <Divider />
        <Tool icon={List} label="Bulleted list" active={state.bulletList} onClick={() => chain().toggleBulletList().run()} />
        <Tool icon={ListOrdered} label="Numbered list" active={state.orderedList} onClick={() => chain().toggleOrderedList().run()} />
        <Tool icon={Quote} label="Quote" active={state.blockquote} onClick={() => chain().toggleBlockquote().run()} />
        <Tool icon={Code2} label="Code block" active={state.codeBlock} onClick={() => chain().toggleCodeBlock().run()} />
        <Tool icon={Minus} label="Divider line" onClick={() => chain().setHorizontalRule().run()} />
        <Tool icon={ImagePlus} label="Image" active={panel === "image"} onClick={() => setPanel(panel === "image" ? null : "image")} />
        <Divider />
        <Tool icon={AlignLeft} label="Align left" active={state.alignLeft} onClick={() => chain().setTextAlign("left").run()} />
        <Tool icon={AlignCenter} label="Align center" active={state.alignCenter} onClick={() => chain().setTextAlign("center").run()} />
        <Tool icon={AlignRight} label="Align right" active={state.alignRight} onClick={() => chain().setTextAlign("right").run()} />
        <Divider />
        <Tool icon={RemoveFormatting} label="Clear formatting" onClick={() => chain().unsetAllMarks().clearNodes().run()} />
      </div>

      {panel === "link" ? (
        <LinkPanel key={state.linkHref} editor={editor} initial={state.linkHref} hasLink={state.link} onClose={() => setPanel(null)} />
      ) : null}
      {panel === "image" ? <ImagePanel editor={editor} onClose={() => setPanel(null)} /> : null}
    </div>
  );
}

function Tool({
  icon: Icon,
  label,
  shortcut,
  active,
  disabled,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const title = shortcut ? `${label} (${shortcut.replace("Mod", "Ctrl/⌘")})` : label;
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active === undefined ? undefined : active}
      title={title}
      className={cn(
        "grid size-8 place-items-center rounded-lg text-cms-ink/60 transition-colors hover:bg-cms-field hover:text-cms-ink disabled:pointer-events-none disabled:opacity-35",
        active && "bg-cms-blue-10 text-cms-blue hover:bg-cms-blue-10 hover:text-cms-blue",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />;
}

function PanelForm({ onSubmit, children }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; children: ReactNode }) {
  return (
    // Overlays the editor instead of pushing it down, so opening or closing a panel never moves the text.
    <form onSubmit={onSubmit} className="absolute inset-x-0 top-full flex flex-wrap items-center gap-2 border-y border-cms-field bg-cms-field px-3 py-2.5 shadow-[0_12px_24px_rgb(28_30_38/0.08)]">
      {children}
    </form>
  );
}

const smallButton = "inline-flex min-h-9 items-center rounded-full px-3.5 text-sm font-semibold transition-colors";

function LinkPanel({ editor, initial, hasLink, onClose }: { editor: Editor; initial: string; hasLink: boolean; onClose: () => void }) {
  const [href, setHref] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = href.trim();
    if (!value) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      onClose();
      return;
    }
    const withProtocol = /^[a-z]+:|^\/|^#/i.test(value) ? value : `https://${value}`;
    if (!isSafeHref(withProtocol)) {
      setError("Use an http(s), mailto:, or tel: link, or a site path.");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: withProtocol }).run();
    onClose();
  }

  return (
    <PanelForm onSubmit={apply}>
      <label htmlFor="link-href" className="text-sm font-semibold">
        Link
      </label>
      <input
        id="link-href"
        autoFocus
        value={href}
        onChange={(event) => {
          setHref(event.target.value);
          setError(null);
        }}
        onKeyDown={(event) => event.key === "Escape" && onClose()}
        placeholder="https://… or /programs/ielts"
        aria-invalid={Boolean(error)}
        className={cn(controlClass, "min-w-0 flex-1 py-1.5")}
      />
      <button type="submit" className={cn(smallButton, "bg-cms-blue text-white hover:bg-cms-blue-deep")}>
        Apply
      </button>
      {hasLink ? (
        <button
          type="button"
          onClick={() => {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            onClose();
          }}
          className={cn(smallButton, "text-danger hover:bg-danger/5")}
        >
          Remove
        </button>
      ) : null}
      <button type="button" onClick={onClose} className={cn(smallButton, "text-cms-ink/60 hover:bg-white")}>
        Cancel
      </button>
      {error ? <p className="basis-full text-sm text-danger">{error}</p> : null}
    </PanelForm>
  );
}

function ImagePanel({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const [error, setError] = useState<string | null>(null);

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSafeImageSrc(src.trim())) {
      setError("Use an https:// image URL or a site path like /images/photo.jpg.");
      return;
    }
    editor.chain().focus().setImage({ src: src.trim(), alt: alt.trim() }).run();
    onClose();
  }

  return (
    <PanelForm onSubmit={apply}>
      <label htmlFor="image-src" className="sr-only">
        Image URL
      </label>
      <input
        id="image-src"
        autoFocus
        value={src}
        onChange={(event) => {
          setSrc(event.target.value);
          setError(null);
        }}
        onKeyDown={(event) => event.key === "Escape" && onClose()}
        placeholder="Image URL"
        aria-invalid={Boolean(error)}
        className={cn(controlClass, "min-w-0 flex-[2] py-1.5")}
      />
      <label htmlFor="image-alt" className="sr-only">
        Alt text
      </label>
      <input
        id="image-alt"
        value={alt}
        onChange={(event) => setAlt(event.target.value)}
        placeholder="Alt text (describe the image)"
        className={cn(controlClass, "min-w-0 flex-[2] py-1.5")}
      />
      <button type="submit" className={cn(smallButton, "bg-cms-blue text-white hover:bg-cms-blue-deep")}>
        Insert
      </button>
      <button type="button" onClick={onClose} className={cn(smallButton, "text-cms-ink/60 hover:bg-white")}>
        Cancel
      </button>
      {error ? <p className="basis-full text-sm text-danger">{error}</p> : null}
    </PanelForm>
  );
}
