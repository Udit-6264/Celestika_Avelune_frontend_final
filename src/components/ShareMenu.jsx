import { useState } from "react";
import {
  WhatsAppIcon,
  FacebookIcon,
  TwitterIcon,
  TelegramIcon,
  EmailIcon,
  LinkIcon,
  CheckIcon,
  MoreIcon,
} from "./PlatformIcons.jsx";

const ShareMenu = ({ url, title, text, onClose }) => {
  const [copied, setCopied] = useState(false);

  const fullMessage = `${text} ${url}`;

  const platforms = [
    {
      name: "WhatsApp",
      icon: <WhatsAppIcon />,
      action: () =>
        window.open(
          `https://wa.me/?text=${encodeURIComponent(fullMessage)}`,
          "_blank",
          "noopener,noreferrer"
        ),
    },
    {
      name: "Facebook",
      icon: <FacebookIcon />,
      action: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank",
          "noopener,noreferrer,width=600,height=500"
        ),
    },
    {
      name: "Twitter / X",
      icon: <TwitterIcon />,
      action: () =>
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank",
          "noopener,noreferrer,width=600,height=500"
        ),
    },
    {
      name: "Telegram",
      icon: <TelegramIcon />,
      action: () =>
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
          "_blank",
          "noopener,noreferrer"
        ),
    },
    {
      name: "Email",
      icon: <EmailIcon />,
      action: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(fullMessage)}`;
      },
    },
  ];

  const handlePlatformClick = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    action();
    onClose();
  };

  const handleCopyLink = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1200);
    } catch (err) {
      onClose();
    }
  };

  const handleMoreOptions = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        // user cancelled
      }
    }
    onClose();
  };

  return (
    <div className="share-menu-pro" onClick={(e) => e.stopPropagation()}>
      <p className="share-menu-pro-heading">Share this product</p>

      <div className="share-menu-pro-grid">
        {platforms.map((p) => (
          <button
            key={p.name}
            className="share-menu-pro-platform"
            onClick={(e) => handlePlatformClick(e, p.action)}
            type="button"
          >
            <span className="share-menu-pro-icon">{p.icon}</span>
            <span className="share-menu-pro-label">{p.name}</span>
          </button>
        ))}
      </div>

      <div className="share-menu-pro-link-row">
        <LinkIcon size={16} />
        <span className="share-menu-pro-url">{url}</span>
        <button type="button" className="share-menu-pro-copy" onClick={handleCopyLink}>
          {copied ? <CheckIcon size={16} /> : "Copy"}
        </button>
      </div>

      {navigator.share && (
        <button type="button" className="share-menu-pro-more" onClick={handleMoreOptions}>
          <MoreIcon size={16} /> More sharing options
        </button>
      )}
    </div>
  );
};

export default ShareMenu;