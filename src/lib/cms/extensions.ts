import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import StarterKit from "@tiptap/starter-kit";

// Shared by the browser editor and the server HTML renderer so both read the same schema.
export const articleExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
      protocols: ["http", "https", "mailto", "tel"],
      HTMLAttributes: { rel: "noopener noreferrer nofollow", target: null },
    },
  }),
  Image.configure({ HTMLAttributes: { loading: "lazy" } }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
];
