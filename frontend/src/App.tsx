import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

interface WardrobeItem {
  _id: string;
  category: string;
  subcategory: string;
  primary_color: string;
  secondary_color: string | null;
  pattern: string;
  style: string;
  occasion: string;
  season: string;
  times_worn: number;
  last_worn: string | null;
  image_url?: string;
}

type OutfitItem = WardrobeItem;

interface CurrentOutfit {
  score: number;
  reasons: string[];
  top: OutfitItem;
  bottom: OutfitItem;
  footwear: OutfitItem;
}

interface OutfitReference {
  top_id: string;
  bottom_id: string;
  footwear_id: string;
}

interface TodayOutfit {
  user_id: string;
  date: string;
  status: string;
  current_outfit: CurrentOutfit;
  shown_outfits: OutfitReference[];
  worn_outfits?: OutfitReference[];
  _id: string;
}

interface OutfitHistoryItem {
  _id: string;
  user_id: string;
  date: string;
  worn_at?: string | null;
  outfit: CurrentOutfit;
  score: number;
  reasons: string[];
}

interface ApiMessage {
  message?: string;
}

type LoadState = "loading" | "ready" | "error";
type ActionType = "wear" | "another" | null;

type Screen =
  | "home"
  | "today"
  | "wardrobe"
  | "history"
  | "insights"
  | "profile";

interface StatusMessage {
  type: "success" | "info" | "error";
  text: string;
}

/* -------------------------------------------------------------------------- */
/* Utilities                                                                  */
/* -------------------------------------------------------------------------- */

const getOutfitKey = (
  outfit: CurrentOutfit | OutfitReference
): string => {
  if ("top_id" in outfit) {
    return `${outfit.top_id}-${outfit.bottom_id}-${outfit.footwear_id}`;
  }

  return `${outfit.top._id}-${outfit.bottom._id}-${outfit.footwear._id}`;
};

async function fetchJson<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    const message = await response.text().catch(() => "");

    throw new Error(
      message || `Request failed with status ${response.status}`
    );
  }

  return response.json() as Promise<T>;
}

const formatDate = (dateString: string): string => {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};



/* -------------------------------------------------------------------------- */
/* Reusable Components                                                        */
/* -------------------------------------------------------------------------- */

interface ImageOrPlaceholderProps {
  src?: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

function ImageOrPlaceholder({
  src,
  alt,
  className = "",
  placeholder = "No image",
}: ImageOrPlaceholderProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div className={`image-placeholder ${className}`}>
        {placeholder}
      </div>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}

interface OutfitItemCardProps {
  label: string;
  item: OutfitItem;
  history?: boolean;
}

function OutfitItemCard({
  label,
  item,
  history = false,
}: OutfitItemCardProps) {
  return (
    <article
      className={
        history ? "history-outfit-item" : "outfit-item"
      }
    >
      <div
        className={
          history
            ? "history-outfit-image"
            : "outfit-image"
        }
      >
        <ImageOrPlaceholder
          src={item.image_url}
          alt={`${item.primary_color} ${item.subcategory}`}
          className="item-image"
        />
      </div>

      <div
        className={
          history
            ? "history-outfit-info"
            : "outfit-info"
        }
      >
        <span
          className={
            history
              ? "history-outfit-label"
              : "outfit-label"
          }
        >
          {label}
        </span>

        <h3>
          {item.primary_color} {item.subcategory}
        </h3>

        <p>{item.style}</p>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Sidebar                                                                    */
/* -------------------------------------------------------------------------- */

interface SidebarProps {
  screen: Screen;
  setScreen: (screen: Screen) => void;
}

function Sidebar({ screen, setScreen }: SidebarProps) {
  const navigation = [
    {
      id: "home" as Screen,
      label: "Home",
      icon: "⌂",
    },
    {
      id: "today" as Screen,
      label: "Today's Outfit",
      icon: "✦",
    },
    {
      id: "wardrobe" as Screen,
      label: "Wardrobe",
      icon: "◈",
    },
    {
      id: "history" as Screen,
      label: "Outfit History",
      icon: "◷",
    },
    {
      id: "insights" as Screen,
      label: "Style Insights",
      icon: "◒",
    },
  ];

  return (
    <>
      <aside className="sidebar">
        <button
          className="brand"
          onClick={() => setScreen("home")}
          aria-label="Go to home"
        >
          <span className="brand-mark">S</span>
          <span>
            <strong>STYLEMATE</strong>
            <small>AI PERSONAL STYLIST</small>
          </span>
        </button>

        <nav className="sidebar-navigation">
          <div className="nav-section-title">MENU</div>

          {navigation.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${
                screen === item.id ? "active" : ""
              }`}
              onClick={() => setScreen(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            className={`nav-item ${
              screen === "profile" ? "active" : ""
            }`}
            onClick={() => setScreen("profile")}
          >
            <span className="nav-icon">◯</span>
            <span>Profile</span>
          </button>

          <div className="sidebar-profile">
            <div className="avatar">A</div>
            <div>
              <strong>Akhil</strong>
              <span>Personal wardrobe</span>
            </div>
          </div>
        </div>
      </aside>

      <nav className="mobile-navigation">
        {[
          { id: "home" as Screen, label: "Home", icon: "⌂" },
          { id: "today" as Screen, label: "Today", icon: "✦" },
          {
            id: "wardrobe" as Screen,
            label: "Wardrobe",
            icon: "◈",
          },
          {
            id: "history" as Screen,
            label: "History",
            icon: "◷",
          },
          {
            id: "profile" as Screen,
            label: "Profile",
            icon: "◯",
          },
        ].map((item) => (
          <button
            key={item.id}
            className={
              screen === item.id ? "mobile-nav-active" : ""
            }
            onClick={() => setScreen(item.id)}
          >
            <span>{item.icon}</span>
            <small>{item.label}</small>
          </button>
        ))}
      </nav>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Top Bar                                                                    */
/* -------------------------------------------------------------------------- */

interface TopBarProps {
  title: string;
  subtitle: string;
}

function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="topbar">
      <div>
        <span className="eyebrow">YOUR PERSONAL STYLIST</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="topbar-actions">
        <button
          className="notification-button"
          aria-label="Notifications"
        >
          ♢
        </button>

        <div className="topbar-avatar">A</div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Stat Card                                                                  */
/* -------------------------------------------------------------------------- */

interface StatCardProps {
  label: string;
  value: string | number;
  description: string;
}

function StatCard({
  label,
  value,
  description,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{description}</small>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Application                                                           */
/* -------------------------------------------------------------------------- */

function App() {
  const [screen, setScreen] = useState<Screen>("home");

  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [todayOutfit, setTodayOutfit] =
    useState<TodayOutfit | null>(null);

  const [outfitHistory, setOutfitHistory] =
    useState<OutfitHistoryItem[]>([]);

  const [wardrobeState, setWardrobeState] =
    useState<LoadState>("loading");

  const [outfitState, setOutfitState] =
    useState<LoadState>("loading");

  const [historyState, setHistoryState] =
    useState<LoadState>("loading");

  const [actionLoading, setActionLoading] =
    useState<ActionType>(null);

  const [selectedWardrobeItem, setSelectedWardrobeItem] =
    useState<WardrobeItem | null>(null);

  const [editingWardrobeItem, setEditingWardrobeItem] =
    useState<WardrobeItem | null>(null);

  const [message, setMessage] =
    useState<StatusMessage | null>(null);
  
  const [deleteConfirmItem, setDeleteConfirmItem] =
    useState<WardrobeItem | null>(null);

  const [selectedHistoryDate, setSelectedHistoryDate] =
    useState<string | null>(null);
  
  const [wardrobeFilter, setWardrobeFilter] =
    useState<string>("All");
  
  const [showAddClothing, setShowAddClothing] =
    useState(false);

  const [addClothingLoading, setAddClothingLoading] =
    useState(false);

  const [addClothingImage, setAddClothingImage] =
    useState<File | null>(null);

  const [addClothingPreview, setAddClothingPreview] =
    useState<string | null>(null);

  const [newClothing, setNewClothing] = useState({
    category: "topwear",
    subcategory: "",
    primary_color: "",
    secondary_color: "",
    pattern: "solid",
    style: "casual",
    occasion: "casual",
    season: "all",
  });

  const [editImageFile, setEditImageFile] =
    useState<File | null>(null);

  const [editImagePreview, setEditImagePreview] =
    useState<string | null>(null);

  const [editImageUploading, setEditImageUploading] =
    useState(false);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();

    return new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );
  });

  /* ---------------------------------------------------------------------- */
  /* Data Loading                                                           */
  /* ---------------------------------------------------------------------- */

  const loadWardrobe = useCallback(async () => {
    setWardrobeState("loading");

    try {
      const data = await fetchJson<WardrobeItem[]>(
        `${API_URL}/wardrobe`
      );

      setWardrobe(data);
      setWardrobeState("ready");
    } catch (error) {
      console.error("Failed to load wardrobe:", error);
      setWardrobeState("error");
    }
  }, []);

  const loadTodayOutfit = useCallback(async () => {
    setOutfitState("loading");

    try {
      const data = await fetchJson<TodayOutfit>(
        `${API_URL}/today-outfit`
      );

      setTodayOutfit(data);
      setOutfitState("ready");
    } catch (error) {
      console.error(
        "Failed to load today's outfit:",
        error
      );

      setTodayOutfit(null);
      setOutfitState("error");
    }
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryState("loading");

    try {
      const data = await fetchJson<OutfitHistoryItem[]>(
        `${API_URL}/outfit-history`
      );

      setOutfitHistory(data);
      setHistoryState("ready");
    } catch (error) {
      console.error(
        "Failed to load outfit history:",
        error
      );

      setOutfitHistory([]);
      setHistoryState("error");
    }
  }, []);

  useEffect(() => {
    void Promise.all([
      loadWardrobe(),
      loadTodayOutfit(),
      loadHistory(),
    ]);
  }, [
    loadWardrobe,
    loadTodayOutfit,
    loadHistory,
  ]);

  /* ---------------------------------------------------------------------- */
  /* Derived State                                                          */
  /* ---------------------------------------------------------------------- */

  const currentOutfitWorn = useMemo(() => {
    if (!todayOutfit) {
      return false;
    }

    const currentKey = getOutfitKey(
      todayOutfit.current_outfit
    );

    return (
      todayOutfit.worn_outfits?.some(
        (wornOutfit) =>
          getOutfitKey(wornOutfit) === currentKey
      ) ?? false
    );
  }, [todayOutfit]);

  const historyByDate = useMemo(() => {
    const grouped = new Map<string, OutfitHistoryItem[]>();

    outfitHistory.forEach((item) => {
      const existing = grouped.get(item.date) ?? [];
      existing.push(item);
      grouped.set(item.date, existing);
    });

    return grouped;
  }, [outfitHistory]);

  const selectedHistory = useMemo(() => {
    if (!selectedHistoryDate) {
      return [];
    }

    return historyByDate.get(selectedHistoryDate) ?? [];
  }, [selectedHistoryDate, historyByDate]);

  const wardrobeStats = useMemo(() => {
    const totalItems = wardrobe.length;

    const totalWears = wardrobe.reduce(
      (sum, item) => sum + item.times_worn,
      0
    );

    const categories = new Map<string, number>();

    wardrobe.forEach((item) => {
      const category =
        item.category || "Other";

      categories.set(
        category,
        (categories.get(category) || 0) + 1
      );
    });

    const styles = new Map<string, number>();

    wardrobe.forEach((item) => {
      if (item.style) {
        styles.set(
          item.style,
          (styles.get(item.style) || 0) + 1
        );
      }
    });

    const colors = new Map<string, number>();

    wardrobe.forEach((item) => {
      if (item.primary_color) {
        colors.set(
          item.primary_color,
          (colors.get(item.primary_color) || 0) + 1
        );
      }
    });

    const mostWorn = [...wardrobe]
      .sort(
        (a, b) =>
          b.times_worn - a.times_worn
      )
      .slice(0, 5);

    const leastWorn = [...wardrobe]
      .sort(
        (a, b) =>
          a.times_worn - b.times_worn
      )
      .slice(0, 5);

    const topStyle =
      [...styles.entries()].sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] || "Not enough data";

    const topColor =
      [...colors.entries()].sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] || "Not enough data";

    return {
      totalItems,
      totalWears,
      categories: [...categories.entries()].sort(
        (a, b) => b[1] - a[1]
      ),
      styles: [...styles.entries()].sort(
        (a, b) => b[1] - a[1]
      ),
      colors: [...colors.entries()].sort(
        (a, b) => b[1] - a[1]
      ),
      mostWorn,
      leastWorn,
      topStyle,
      topColor,
    };
  }, [wardrobe]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthName = currentMonth.toLocaleString(
    "default",
    {
      month: "long",
    }
  );

  const calendarDays = useMemo(() => {
    const firstDay = new Date(
      year,
      month,
      1
    ).getDay();

    const daysInMonth = new Date(
      year,
      month + 1,
      0
    ).getDate();

    return [
      ...Array.from(
        { length: firstDay },
        () => null
      ),
      ...Array.from(
        { length: daysInMonth },
        (_, index) => index + 1
      ),
    ];
  }, [year, month]);

  /* ---------------------------------------------------------------------- */
  /* Date Helpers                                                           */
  /* ---------------------------------------------------------------------- */

  const getDateForDay = (day: number): string => {
    return [
      year,
      String(month + 1).padStart(2, "0"),
      String(day).padStart(2, "0"),
    ].join("-");
  };

  const isToday = (day: number): boolean => {
    const today = new Date();

    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const moveMonth = (offset: number) => {
    setCurrentMonth(
      new Date(year, month + offset, 1)
    );

    setSelectedHistoryDate(null);
  };


  /* ---------------------------------------------------------------------- */
  /* Actions                                                                */
  /* ---------------------------------------------------------------------- */
  const handleAddClothing = async () => {
  if (
    !newClothing.subcategory.trim() ||
    !newClothing.primary_color.trim() ||
    !newClothing.pattern.trim() ||
    !newClothing.style.trim() ||
    !newClothing.occasion.trim()
  ) {
    setMessage({
      type: "error",
      text: "Please fill in all required clothing details.",
    });

    return;
  }

  setAddClothingLoading(true);
  setMessage(null);

  try {
    let imageUrl: string | undefined;

    /* -------------------------------------------------------------- */
    /* Upload image first                                             */
    /* -------------------------------------------------------------- */

    if (addClothingImage) {
      const formData = new FormData();

      formData.append(
        "file",
        addClothingImage
      );

      const uploadResponse =
        await fetchJson<{
          message: string;
          image_url: string;
        }>(
          `${API_URL}/upload-image`,
          {
            method: "POST",
            body: formData,
          }
        );

      imageUrl = uploadResponse.image_url;
    }

    /* -------------------------------------------------------------- */
    /* Create wardrobe item                                           */
    /* -------------------------------------------------------------- */

    await fetchJson<ApiMessage>(
      `${API_URL}/wardrobe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: newClothing.category,
          subcategory:
            newClothing.subcategory.trim(),
          primary_color:
            newClothing.primary_color.trim(),
          secondary_color:
            newClothing.secondary_color.trim() ||
            null,
          pattern: newClothing.pattern.trim(),
          style: newClothing.style.trim(),
          occasion: newClothing.occasion.trim(),
          season: newClothing.season,
          times_worn: 0,
          last_worn: null,
          image_url: imageUrl || null,
        }),
      }
    );

    /* -------------------------------------------------------------- */
    /* Reset form                                                      */
    /* -------------------------------------------------------------- */

    setNewClothing({
      category: "topwear",
      subcategory: "",
      primary_color: "",
      secondary_color: "",
      pattern: "solid",
      style: "casual",
      occasion: "casual",
      season: "all",
    });

    setAddClothingImage(null);
    setAddClothingPreview(null);
    setShowAddClothing(false);

    /* -------------------------------------------------------------- */
    /* Refresh wardrobe                                                */
    /* -------------------------------------------------------------- */

    await loadWardrobe();

    setMessage({
      type: "success",
      text: "Clothing added to your wardrobe.",
    });
  } catch (error) {
    console.error(
      "Failed to add clothing:",
      error
    );

    setMessage({
      type: "error",
      text:
        "Could not add this clothing item. Please try again.",
    });
  } finally {
    setAddClothingLoading(false);
  }
};

  const handleAddClothingImage = (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    setMessage({
      type: "error",
      text: "Please select an image file.",
    });

    return;
  }

  setAddClothingImage(file);

  const previewUrl =
    URL.createObjectURL(file);

  setAddClothingPreview(previewUrl);
};

  const handleEditImageChange = (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    setMessage({
      type: "error",
      text: "Please select an image file.",
    });

    return;
  }

  setEditImageFile(file);

  const previewUrl =
    URL.createObjectURL(file);

  setEditImagePreview(previewUrl);
};

  const handleUpdateWardrobeItem = async (
  item: WardrobeItem
) => {
  try {
    setMessage(null);
    setEditImageUploading(true);

    let imageUrl = item.image_url || null;

    /* -------------------------------------------------------------- */
    /* Upload new image only if user selected one                     */
    /* -------------------------------------------------------------- */

    if (editImageFile) {
      const formData = new FormData();

      formData.append(
        "file",
        editImageFile
      );

      const uploadResponse =
        await fetchJson<{
          message: string;
          image_url: string;
        }>(
          `${API_URL}/upload-image`,
          {
            method: "POST",
            body: formData,
          }
        );

      imageUrl =
        uploadResponse.image_url;
    }

    /* -------------------------------------------------------------- */
    /* Update wardrobe item                                           */
    /* -------------------------------------------------------------- */

    await fetchJson<ApiMessage>(
      `${API_URL}/wardrobe/${item._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: item.category,
          subcategory: item.subcategory,
          primary_color: item.primary_color,
          secondary_color:
            item.secondary_color || null,
          pattern: item.pattern,
          style: item.style,
          occasion: item.occasion,
          season: item.season || "all",
          times_worn:
            item.times_worn ?? 0,
          last_worn:
            item.last_worn || null,
          image_url: imageUrl,
        }),
      }
    );

    /* -------------------------------------------------------------- */
    /* Refresh wardrobe                                               */
    /* -------------------------------------------------------------- */

    await loadWardrobe();

    /* -------------------------------------------------------------- */
    /* Reset edit image state                                         */
    /* -------------------------------------------------------------- */

    setEditImageFile(null);
    setEditImagePreview(null);

    setEditingWardrobeItem(null);
    setSelectedWardrobeItem(null);

    setMessage({
      type: "success",
      text: "Wardrobe item updated successfully.",
    });
  } catch (error) {
    console.error(
      "Failed to update wardrobe item:",
      error
    );

    setMessage({
      type: "error",
      text:
        "Could not update this wardrobe item.",
    });
  } finally {
    setEditImageUploading(false);
  }
};

  const handleWearOutfit = async () => {
    if (
      !todayOutfit ||
      currentOutfitWorn ||
      actionLoading
    ) {
      return;
    }

    setActionLoading("wear");
    setMessage(null);

    try {
      const data = await fetchJson<ApiMessage>(
        `${API_URL}/wear-outfit`,
        {
          method: "POST",
        }
      );

      setMessage({
        type: "success",
        text:
          data.message ||
          "Outfit marked as worn.",
      });

      await Promise.all([
        loadWardrobe(),
        loadTodayOutfit(),
        loadHistory(),
      ]);
    } catch (error) {
      console.error(
        "Failed to mark outfit as worn:",
        error
      );

      setMessage({
        type: "error",
        text:
          "Could not mark the outfit as worn.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteWardrobeItem = async (
    item: WardrobeItem
  ) => {
  try {
    setMessage(null);

    await fetchJson<ApiMessage>(
      `${API_URL}/wardrobe/${item._id}`,
      {
        method: "DELETE",
      }
    );

    // Close both modals
    setDeleteConfirmItem(null);
    setSelectedWardrobeItem(null);

    // Refresh wardrobe from backend
    await loadWardrobe();

    setMessage({
      type: "success",
      text: "Item deleted from your wardrobe.",
    });
  } catch (error) {
    console.error(
      "Failed to delete wardrobe item:",
      error
    );

    setMessage({
      type: "error",
      text: "Could not delete this wardrobe item.",
    });
  }
};
  const handleTryAnother = async () => {
    if (!todayOutfit || actionLoading) {
      return;
    }

    setActionLoading("another");
    setMessage(null);

    try {
      const data = await fetchJson<
        CurrentOutfit | ApiMessage
      >(`${API_URL}/next-outfit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (
        "message" in data &&
        data.message
      ) {
        setMessage({
          type: "info",
          text: data.message,
        });

        return;
      }

      setTodayOutfit((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          current_outfit:
            data as CurrentOutfit,
        };
      });

      setMessage({
        type: "success",
        text:
          "Here's another outfit for you.",
      });
    } catch (error) {
      console.error(
        "Failed to load another outfit:",
        error
      );

      setMessage({
        type: "error",
        text:
          "Could not load another outfit.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Screen Header Data                                                     */
  /* ---------------------------------------------------------------------- */

  const screenMeta: Record<
    Screen,
    { title: string; subtitle: string }
  > = {
    home: {
      title: "Good morning, Akhil",
      subtitle:
        "Your wardrobe, intelligently styled.",
    },
    today: {
      title: "Today's Outfit",
      subtitle:
        "A look selected from what you already own.",
    },
    wardrobe: {
      title: "My Wardrobe",
      subtitle:
        "Everything you own, organized in one place.",
    },
    history: {
      title: "Outfit History",
      subtitle:
        "See what you've worn and build more variety.",
    },
    insights: {
      title: "Style Insights",
      subtitle:
        "Understand how you're actually using your wardrobe.",
    },
    profile: {
      title: "Your Profile",
      subtitle:
        "Your personal style and wardrobe preferences.",
    },
  };

  /* ---------------------------------------------------------------------- */
  /* Home Screen                                                            */
  /* ---------------------------------------------------------------------- */

  const renderHome = () => {
    return (
      <div className="screen">
        <div className="home-hero">
          <div className="hero-copy">
            <span className="hero-kicker">
              YOUR LOOK FOR TODAY
            </span>

            {todayOutfit ? (
              <>
                <h2>
                  Let your wardrobe
                  <br />
                  do the work.
                </h2>

                <p>
                  We found a combination from
                  your own clothes that balances
                  colour, style and what you've
                  worn recently.
                </p>

                <div className="hero-actions">
                  <button
                    className="primary-button"
                    onClick={() =>
                      setScreen("today")
                    }
                  >
                    View today's outfit
                    <span>→</span>
                  </button>

                  <button
                    className="text-button"
                    onClick={() =>
                      setScreen("wardrobe")
                    }
                  >
                    Explore wardrobe
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>
                  Your wardrobe,
                  <br />
                  intelligently styled.
                </h2>

                <p>
                  Add clothing to your wardrobe
                  and let your personal stylist
                  create better combinations.
                </p>

                <button
                  className="primary-button"
                  onClick={() =>
                    setScreen("wardrobe")
                  }
                >
                  View my wardrobe
                  <span>→</span>
                </button>
              </>
            )}
          </div>

          {todayOutfit && (
            <div className="hero-outfit">
              <div className="hero-outfit-images">
                <div className="hero-image hero-image-large">
                  <ImageOrPlaceholder
                    src={
                      todayOutfit.current_outfit
                        .top.image_url
                    }
                    alt="Today's top"
                    className="item-image"
                    placeholder="TOP"
                  />
                </div>

                <div className="hero-image-stack">
                  <div className="hero-image">
                    <ImageOrPlaceholder
                      src={
                        todayOutfit.current_outfit
                          .bottom.image_url
                      }
                      alt="Today's bottom"
                      className="item-image"
                      placeholder="BOTTOM"
                    />
                  </div>

                  <div className="hero-image">
                    <ImageOrPlaceholder
                      src={
                        todayOutfit.current_outfit
                          .footwear.image_url
                      }
                      alt="Today's footwear"
                      className="item-image"
                      placeholder="SHOES"
                    />
                  </div>
                </div>
              </div>

              
            </div>
          )}
        </div>

        <div className="stats-grid">
          <StatCard
            label="WARDROBE"
            value={wardrobeStats.totalItems}
            description="Items you own"
          />

          <StatCard
            label="OUTFITS WORN"
            value={outfitHistory.length}
            description="Recorded outfits"
          />

          <StatCard
            label="TOP STYLE"
            value={wardrobeStats.topStyle}
            description="Most common style"
          />

          <StatCard
            label="FAVOURITE COLOUR"
            value={wardrobeStats.topColor}
            description="Most common colour"
          />
        </div>

        <div className="home-section-grid">
          <section className="dashboard-card">
            <div className="card-heading">
              <div>
                <span className="eyebrow">
                  WARDROBE
                </span>
                <h3>Your collection</h3>
              </div>

              <button
                className="small-link"
                onClick={() =>
                  setScreen("wardrobe")
                }
              >
                View all →
              </button>
            </div>

            <div className="category-list">
              {wardrobeStats.categories
                .slice(0, 5)
                .map(([category, count]) => {
                  const percentage =
                    wardrobeStats.totalItems > 0
                      ? (count /
                          wardrobeStats.totalItems) *
                        100
                      : 0;

                  return (
                    <div
                      className="category-row"
                      key={category}
                    >
                      <div className="category-name">
                        <span>
                          {category}
                        </span>
                        <strong>
                          {count}
                        </strong>
                      </div>

                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>

          <section className="dashboard-card">
            <div className="card-heading">
              <div>
                <span className="eyebrow">
                  ROTATION
                </span>
                <h3>Items to rediscover</h3>
              </div>

              <button
                className="small-link"
                onClick={() =>
                  setScreen("insights")
                }
              >
                Insights →
              </button>
            </div>

            {wardrobeStats.leastWorn.length >
            0 ? (
              <div className="mini-items">
                {wardrobeStats.leastWorn
                  .slice(0, 3)
                  .map((item) => (
                    <div
                      className="mini-item"
                      key={item._id}
                    >
                      <div className="mini-item-image">
                        <ImageOrPlaceholder
                          src={item.image_url}
                          alt={item.subcategory}
                          className="item-image"
                          placeholder="ITEM"
                        />
                      </div>

                      <div>
                        <strong>
                          {item.primary_color}{" "}
                          {item.subcategory}
                        </strong>
                        <span>
                          Worn{" "}
                          {item.times_worn}{" "}
                          times
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="empty-small">
                Add more wardrobe items to
                see rotation insights.
              </div>
            )}
          </section>
        </div>
      </div>
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Today's Outfit Screen                                                  */
  /* ---------------------------------------------------------------------- */

  const renderToday = () => {
  return (
    <div className="screen today-screen">

      {/* ---------------------------------------------------------------- */}
      {/* Loading                                                          */}
      {/* ---------------------------------------------------------------- */}

      {outfitState === "loading" && (
        <div className="today-loading-state">
          <div className="today-loading-icon">
            ✦
          </div>

          <div>
            <span className="eyebrow">
              YOUR PERSONAL STYLIST
            </span>

            <h3>
              Creating your outfit...
            </h3>

            <p>
              Looking through your wardrobe
              for a combination that works.
            </p>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Error                                                            */}
      {/* ---------------------------------------------------------------- */}

      {outfitState === "error" && (
        <div className="today-empty-state error-state">
          <div className="today-empty-icon">
            !
          </div>

          <span className="eyebrow">
            SOMETHING WENT WRONG
          </span>

          <h3>
            We couldn't create your outfit.
          </h3>

          <p>
            Your wardrobe is still safe.
            Let's try generating the
            recommendation again.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              void loadTodayOutfit()
            }
          >
            Try again
          </button>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Ready                                                             */}
      {/* ---------------------------------------------------------------- */}

      {outfitState === "ready" &&
        todayOutfit && (
          <>
            {/* ---------------------------------------------------------- */}
            {/* Date / status                                               */}
            {/* ---------------------------------------------------------- */}

            <div className="today-intro">
              <div>
                <span className="today-date-label">
                  {formatDate(
                    todayOutfit.date
                  )}
                </span>

                <p>
                  Your stylist has picked
                  something from what you
                  already own.
                </p>
              </div>

              <span
                className={`today-status ${
                  currentOutfitWorn
                    ? "is-worn"
                    : ""
                }`}
              >
                <span>
                  {currentOutfitWorn
                    ? "✓"
                    : "✦"}
                </span>

                {currentOutfitWorn
                  ? "Worn today"
                  : "Recommended for today"}
              </span>
            </div>

            {/* ---------------------------------------------------------- */}
            {/* Main outfit hero                                            */}
            {/* ---------------------------------------------------------- */}

            <section className="today-hero-card">

              <div className="today-hero-copy">
                <span className="eyebrow">
                  YOUR STYLIST PICK
                </span>

                <h2>
                  A look built
                  <br />
                  from your wardrobe.
                </h2>

                <p>
                  No shopping required.
                  Just a combination of
                  pieces you already own.
                </p>
              </div>

              <div className="today-look-grid">

                {/* TOP */}
                <div className="today-look-piece today-look-piece-main">
                  <div className="today-look-image">
                    <ImageOrPlaceholder
                      src={
                        todayOutfit
                          .current_outfit
                          .top.image_url
                      }
                      alt={
                        todayOutfit
                          .current_outfit
                          .top
                          .subcategory ||
                        "Today's top"
                      }
                      className="item-image"
                      placeholder="TOP"
                    />

                    <span className="today-piece-number">
                      01
                    </span>
                  </div>

                  <div className="today-piece-info">
                    <span>TOP</span>

                    <strong>
                      {
                        todayOutfit
                          .current_outfit
                          .top
                          .primary_color
                      }{" "}
                      {
                        todayOutfit
                          .current_outfit
                          .top
                          .subcategory
                      }
                    </strong>

                    <small>
                      {
                        todayOutfit
                          .current_outfit
                          .top
                          .style
                      }{" "}
                      ·{" "}
                      {
                        todayOutfit
                          .current_outfit
                          .top
                          .pattern
                      }
                    </small>
                  </div>
                </div>

                {/* BOTTOM */}
                <div className="today-look-piece">
                  <div className="today-look-image">
                    <ImageOrPlaceholder
                      src={
                        todayOutfit
                          .current_outfit
                          .bottom.image_url
                      }
                      alt={
                        todayOutfit
                          .current_outfit
                          .bottom
                          .subcategory ||
                        "Today's bottom"
                      }
                      className="item-image"
                      placeholder="BOTTOM"
                    />

                    <span className="today-piece-number">
                      02
                    </span>
                  </div>

                  <div className="today-piece-info">
                    <span>BOTTOM</span>

                    <strong>
                      {
                        todayOutfit
                          .current_outfit
                          .bottom
                          .primary_color
                      }{" "}
                      {
                        todayOutfit
                          .current_outfit
                          .bottom
                          .subcategory
                      }
                    </strong>

                    <small>
                      {
                        todayOutfit
                          .current_outfit
                          .bottom
                          .style
                      }{" "}
                      ·{" "}
                      {
                        todayOutfit
                          .current_outfit
                          .bottom
                          .pattern
                      }
                    </small>
                  </div>
                </div>

                {/* FOOTWEAR */}
                <div className="today-look-piece">
                  <div className="today-look-image">
                    <ImageOrPlaceholder
                      src={
                        todayOutfit
                          .current_outfit
                          .footwear
                          .image_url
                      }
                      alt={
                        todayOutfit
                          .current_outfit
                          .footwear
                          .subcategory ||
                        "Today's footwear"
                      }
                      className="item-image"
                      placeholder="SHOES"
                    />

                    <span className="today-piece-number">
                      03
                    </span>
                  </div>

                  <div className="today-piece-info">
                    <span>FOOTWEAR</span>

                    <strong>
                      {
                        todayOutfit
                          .current_outfit
                          .footwear
                          .primary_color
                      }{" "}
                      {
                        todayOutfit
                          .current_outfit
                          .footwear
                          .subcategory
                      }
                    </strong>

                    <small>
                      {
                        todayOutfit
                          .current_outfit
                          .footwear
                          .style
                      }{" "}
                      ·{" "}
                      {
                        todayOutfit
                          .current_outfit
                          .footwear
                          .pattern
                      }
                    </small>
                  </div>
                </div>

              </div>

              {/* -------------------------------------------------------- */}
              {/* Actions                                                    */}
              {/* -------------------------------------------------------- */}

              <div className="today-hero-actions">

                <button
                  className="today-wear-button"
                  onClick={() =>
                    void handleWearOutfit()
                  }
                  disabled={
                    Boolean(actionLoading) ||
                    currentOutfitWorn
                  }
                >
                  <span>
                    {currentOutfitWorn
                      ? "✓"
                      : "✦"}
                  </span>

                  {actionLoading === "wear"
                    ? "Marking as worn..."
                    : currentOutfitWorn
                    ? "Worn today"
                    : "Wear this outfit"}
                </button>

                <button
                  className="today-another-button"
                  onClick={() =>
                    void handleTryAnother()
                  }
                  disabled={Boolean(
                    actionLoading
                  )}
                >
                  <span>
                    {actionLoading ===
                    "another"
                      ? "↻"
                      : "⟳"}
                  </span>

                  {actionLoading === "another"
                    ? "Finding another..."
                    : "Try another outfit"}
                </button>

              </div>

              {message && (
                <div
                  className={`status-message ${message.type}`}
                  role="status"
                >
                  {message.text}
                </div>
              )}
            </section>

            {/* ---------------------------------------------------------- */}
            {/* Why we picked this                                          */}
            {/* ---------------------------------------------------------- */}

            <section className="today-why-section">

              <div className="today-why-heading">
                <div className="today-why-symbol">
                  ✦
                </div>

                <div>
                  <span className="eyebrow">
                    THE STYLIST'S TAKE
                  </span>

                  <h3>
                    Why we picked this
                  </h3>

                  <p>
                    A recommendation based
                    on the clothes you already
                    have.
                  </p>
                </div>
              </div>

              <div className="today-reasons-grid">
                {todayOutfit
                  .current_outfit
                  .reasons
                  .length > 0 ? (
                  todayOutfit
                    .current_outfit
                    .reasons
                    .map(
                      (
                        reason,
                        index
                      ) => (
                        <div
                          className="today-reason-card"
                          key={`${reason}-${index}`}
                        >
                          <span className="today-reason-check">
                            ✓
                          </span>

                          <div>
                            <span>
                              0
                              {index + 1}
                            </span>

                            <p>
                              {reason}
                            </p>
                          </div>
                        </div>
                      )
                    )
                ) : (
                  <div className="today-reason-card">
                    <span className="today-reason-check">
                      ✓
                    </span>

                    <div>
                      <span>01</span>

                      <p>
                        Recommended based
                        on your wardrobe.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="today-stylist-note">
                <span>✦</span>

                <p>
                  Your stylist considers
                  colour, style, occasion
                  and how recently you've
                  worn your clothes.
                </p>
              </div>

            </section>
          </>
        )}

      {/* ---------------------------------------------------------------- */}
      {/* No outfit                                                        */}
      {/* ---------------------------------------------------------------- */}

      {outfitState === "ready" &&
        !todayOutfit && (
          <div className="today-empty-state">

            <div className="today-empty-icon">
              ✦
            </div>

            <span className="eyebrow">
              YOUR STYLIST IS READY
            </span>

            <h3>
              Your wardrobe needs
              a little more to work with.
            </h3>

            <p>
              Add a few more clothing
              pieces and we'll create
              better combinations for you.
            </p>

            <button
              className="primary-button"
              onClick={() =>
                setScreen("wardrobe")
              }
            >
              Go to wardrobe
              <span>→</span>
            </button>

          </div>
        )}
    </div>
  );
};

  /* ---------------------------------------------------------------------- */
  /* Wardrobe Screen                                                        */
  /* ---------------------------------------------------------------------- */
  const filteredWardrobe = useMemo(() => {
  if (wardrobeFilter === "All") {
    return wardrobe;
  }

  return wardrobe.filter(
    (item) =>
      (item.category || "Other").toLowerCase() ===
      wardrobeFilter.toLowerCase()
  );
}, [wardrobe, wardrobeFilter]);


  const renderWardrobe = () => {
    const categoryCounts =
      wardrobeStats.categories;

    return (
      <div className="screen">
        <div className="wardrobe-toolbar">
          <div className="wardrobe-count">
            <strong>
              {wardrobe.length}
            </strong>
            <span>pieces in your wardrobe</span>
          </div>

          <button
            className="add-clothing-button"
            onClick={() => {
              setMessage(null);
              setShowAddClothing(true);
            }}
          >
            <span className="add-clothing-icon">+</span>
            Add Clothing
          </button>
        </div>

        <div className="wardrobe-filter-row">
          <button
            className={`filter-pill ${
              wardrobeFilter === "All"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setWardrobeFilter("All")
            }
          >
            All
            <span>{wardrobe.length}</span>
          </button>

          {categoryCounts.map(
            ([category, count]) => (
              <button
                className={`filter-pill ${
                  wardrobeFilter === category
                    ? "active"
                    : ""
                }`}
                key={category}
                onClick={() =>
                  setWardrobeFilter(category)
                }
              >
                {category}
                <span>{count}</span>
              </button>
            )
          )}
        </div>

        {wardrobeState === "loading" && (
          <div className="message">
            <p>Loading wardrobe...</p>
          </div>
        )}

        {wardrobeState === "error" && (
          <div className="message error-state">
            <h3>
              Could not load your wardrobe
            </h3>

            <button
              className="secondary-button"
              onClick={() =>
                void loadWardrobe()
              }
            >
              Retry
            </button>
          </div>
        )}

        {wardrobeState === "ready" &&
          wardrobe.length === 0 && (
            <div className="empty-wardrobe">
              <div className="empty-wardrobe-icon">
                ◈
              </div>

              <h3>
                Your wardrobe is waiting.
              </h3>

              <p>
                Add your first clothing item
                to start building your digital
                wardrobe.
              </p>

              <button
                className="primary-button"
                onClick={() => {
                  setMessage(null);
                  setShowAddClothing(true);
                }}
              >
                + Add your first item
              </button>
            </div>
          )}

        {wardrobeState === "ready" &&
          wardrobe.length > 0 && (
            <div className="new-wardrobe-grid">
              {filteredWardrobe.map((item) => (
                <article
                  className="new-wardrobe-card"
                  key={item._id}
                  onClick={() => setSelectedWardrobeItem(item)}
                >
                  <div className="new-wardrobe-image">
                    <ImageOrPlaceholder
                      src={item.image_url}
                      alt={`${item.primary_color} ${item.subcategory}`}
                      className="item-image"
                      placeholder="NO IMAGE"
                    />

                    <span className="item-wear-badge">
                      {item.times_worn}× worn
                    </span>
                  </div>

                  <div className="new-wardrobe-info">
                    <div>
                      <span className="item-overline">
                        {item.category}
                      </span>

                      <h3>
                        {item.primary_color}{" "}
                        {item.subcategory}
                      </h3>
                    </div>

                    <div className="wardrobe-meta">
                      <span>
                        {item.style}
                      </span>

                      <span>·</span>

                      <span>
                        {item.pattern}
                      </span>
                    </div>

                    <div className="wardrobe-card-footer">
                      <span>
                        {item.occasion}
                      </span>

                      <button
                        aria-label={`View ${item.subcategory}`}
                      >
                        →
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
      </div>
    );
  };

  /* ---------------------------------------------------------------------- */
  /* History Screen                                                         */
  /* ---------------------------------------------------------------------- */

  const renderHistory = () => {
    return (
      <div className="screen">
        {historyState === "loading" && (
          <div className="message">
            <p>
              Loading outfit history...
            </p>
          </div>
        )}

        {historyState === "error" && (
          <div className="message error-state">
            <h3>
              Could not load outfit history
            </h3>

            <button
              className="secondary-button"
              onClick={() =>
                void loadHistory()
              }
            >
              Retry
            </button>
          </div>
        )}

        {historyState === "ready" && (
          <div className="history-layout">
            <div className="calendar-card">
              <div className="calendar-navigation">
                <button
                  className="calendar-nav-button"
                  aria-label="Previous month"
                  onClick={() =>
                    moveMonth(-1)
                  }
                >
                  ‹
                </button>

                <div>
                  <span className="eyebrow">
                    OUTFIT CALENDAR
                  </span>

                  <h3>
                    {monthName} {year}
                  </h3>
                </div>

                <button
                  className="calendar-nav-button"
                  aria-label="Next month"
                  onClick={() =>
                    moveMonth(1)
                  }
                >
                  ›
                </button>
              </div>

              <div className="calendar-weekdays">
                {[
                  "Sun",
                  "Mon",
                  "Tue",
                  "Wed",
                  "Thu",
                  "Fri",
                  "Sat",
                ].map((day) => (
                  <div key={day}>
                    {day}
                  </div>
                ))}
              </div>

              <div className="calendar-grid">
                {calendarDays.map(
                  (day, index) => {
                    if (day === null) {
                      return (
                        <div
                          className="calendar-day empty"
                          key={`empty-${index}`}
                        />
                      );
                    }

                    const dateString =
                      getDateForDay(day);

                    const history =
                      historyByDate.get(dateString) ?? [];
            

                    const firstHistory = history[0];
                    const hasHistory = history.length > 0;

                    const selected =
                      selectedHistoryDate === dateString;

                    return (
                      <button
                        key={dateString}
                        className={`calendar-day ${
                          isToday(day)
                            ? "today"
                            : ""
                        } ${
                          hasHistory
                            ? "has-outfit"
                            : ""
                        } ${
                          selected
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          setSelectedHistoryDate(
                            hasHistory
                              ? dateString
                              : null
                          )
                        }
                      >
                        <span className="calendar-date">
                          {day}
                        </span>

                        {firstHistory && (
                          <div className="calendar-outfit-preview">
                            <ImageOrPlaceholder
                              src={
                                firstHistory.outfit
                                  .top
                                  .image_url
                              }
                              alt="Top"
                              className="calendar-preview-image"
                              placeholder="T"
                            />

                            <ImageOrPlaceholder
                              src={
                                firstHistory.outfit
                                  .bottom
                                  .image_url
                              }
                              alt="Bottom"
                              className="calendar-preview-image"
                              placeholder="B"
                            />
                          </div>
                        )}

                        {hasHistory && (
                          <span className="calendar-worn-dot">
                            {history.length > 1
                              ? `${history.length}×`
                              : "✓"}
                          </span>
                        )}
                      </button>
                    );
                  }
                )}
              </div>

              <div className="calendar-legend">
                <span>
                  <b className="legend-dot worn">
                    ✓
                  </b>
                  Outfit worn
                </span>

                <span>
                  <b className="legend-dot today-dot" />
                  Today
                </span>
              </div>
            </div>

            <div className="history-detail-card">
              {selectedHistory.length > 0 ? (
                <>
                  <div className="history-detail-header">
                    <div>
                      <span className="history-detail-label">
                        OUTFITS WORN
                      </span>

                      <h3>
                        {formatDate(
                          selectedHistoryDate!
                        )}
                      </h3>
                    </div>

                    <span className="history-outfit-count">
                      {selectedHistory.length} {selectedHistory.length === 1 ? "outfit" : "outfits"}
                    </span>
                  </div>

                  <div className="history-multiple-outfits">
                    {selectedHistory.map((historyItem, index) => (
                      <article
                        className="history-outfit-card"
                        key={historyItem._id}
                      >
                        <div className="history-outfit-card-header">
                          <div>
                            <span className="history-detail-label">
                              OUTFIT {String(index + 1).padStart(2, "0")}
                            </span>

                            {historyItem.worn_at && (
                              <span className="history-worn-time">
                                {new Date(historyItem.worn_at).toLocaleTimeString(
                                  "en-US",
                                  { hour: "numeric", minute: "2-digit" }
                                )}
                              </span>
                            )}
                          </div>

                          <span className="history-worn-check">
                            ✓ WORN
                          </span>
                        </div>

                        <div className="history-outfit-items">
                          <OutfitItemCard
                            label="TOP"
                            item={historyItem.outfit.top}
                            history
                          />

                          <OutfitItemCard
                            label="BOTTOM"
                            item={historyItem.outfit.bottom}
                            history
                          />

                          <OutfitItemCard
                            label="FOOTWEAR"
                            item={historyItem.outfit.footwear}
                            history
                          />
                        </div>

                        {historyItem.reasons.length > 0 && (
                          <div className="history-reasons">
                            <h4>Why it was recommended</h4>

                            <div className="history-reason-list">
                              {historyItem.reasons.map((reason, reasonIndex) => (
                                <span
                                  className="history-reason"
                                  key={`${reason}-${reasonIndex}`}
                                >
                                  ✓ {reason}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                <div className="history-empty">
                  <div className="history-empty-icon">◷</div>

                  <h3>Select a day</h3>

                  <p>
                    Choose a date with an outfit to see what you wore.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {historyState === "ready" &&
          outfitHistory.length === 0 && (
            <div className="empty-history-banner">
              <span>◷</span>
              <div>
                <strong>
                  Your outfit history is
                  empty.
                </strong>
                <p>
                  Wear an outfit to start
                  building your style history.
                </p>
              </div>
            </div>
          )}
      </div>
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Insights Screen                                                        */
  /* ---------------------------------------------------------------------- */

  const renderInsights = () => {
    const maxStyle =
      wardrobeStats.styles[0]?.[1] || 1;

    const maxColor =
      wardrobeStats.colors[0]?.[1] || 1;

    return (
      <div className="screen">
        <div className="insights-overview">
          <div className="insight-big-card">
            <span className="eyebrow">
              WARDROBE SIZE
            </span>

            <strong>
              {wardrobeStats.totalItems}
            </strong>

            <p>
              pieces currently in your
              wardrobe
            </p>
          </div>

          <div className="insight-big-card">
            <span className="eyebrow">
              TOTAL WEARS
            </span>

            <strong>
              {wardrobeStats.totalWears}
            </strong>

            <p>
              recorded uses across your
              wardrobe
            </p>
          </div>

          <div className="insight-big-card">
            <span className="eyebrow">
              TOP STYLE
            </span>

            <strong className="text-value">
              {wardrobeStats.topStyle}
            </strong>

            <p>
              your most represented style
            </p>
          </div>
        </div>

        <div className="insights-grid">
          <section className="dashboard-card">
            <div className="card-heading">
              <div>
                <span className="eyebrow">
                  STYLE PROFILE
                </span>
                <h3>
                  What's in your wardrobe
                </h3>
              </div>
            </div>

            <div className="insight-bars">
              {wardrobeStats.styles
                .slice(0, 6)
                .map(([style, count]) => (
                  <div
                    className="insight-bar-row"
                    key={style}
                  >
                    <div>
                      <span>
                        {style}
                      </span>
                      <strong>
                        {count}
                      </strong>
                    </div>

                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${
                            (count /
                              maxStyle) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </section>

          <section className="dashboard-card">
            <div className="card-heading">
              <div>
                <span className="eyebrow">
                  COLOUR PROFILE
                </span>
                <h3>
                  Your colour palette
                </h3>
              </div>
            </div>

            <div className="insight-bars">
              {wardrobeStats.colors
                .slice(0, 6)
                .map(([color, count]) => (
                  <div
                    className="insight-bar-row"
                    key={color}
                  >
                    <div>
                      <span>
                        {color}
                      </span>
                      <strong>
                        {count}
                      </strong>
                    </div>

                    <div className="progress-track">
                      <div
                        className="progress-fill dark"
                        style={{
                          width: `${
                            (count /
                              maxColor) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </div>

        <div className="insights-grid">
          <section className="dashboard-card">
            <div className="card-heading">
              <div>
                <span className="eyebrow">
                  MOST WORN
                </span>
                <h3>
                  Your wardrobe favourites
                </h3>
              </div>
            </div>

            <div className="insight-item-list">
              {wardrobeStats.mostWorn
                .slice(0, 5)
                .map((item, index) => (
                  <div
                    className="insight-item"
                    key={item._id}
                  >
                    <span className="rank">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <div className="insight-item-image">
                      <ImageOrPlaceholder
                        src={item.image_url}
                        alt={item.subcategory}
                        className="item-image"
                        placeholder="ITEM"
                      />
                    </div>

                    <div className="insight-item-copy">
                      <strong>
                        {item.primary_color}{" "}
                        {item.subcategory}
                      </strong>
                      <span>
                        {item.style}
                      </span>
                    </div>

                    <strong className="wear-number">
                      {item.times_worn}×
                    </strong>
                  </div>
                ))}
            </div>
          </section>

          <section className="dashboard-card">
            <div className="card-heading">
              <div>
                <span className="eyebrow">
                  UNDERUSED
                </span>
                <h3>
                  Items worth rediscovering
                </h3>
              </div>
            </div>

            <div className="insight-item-list">
              {wardrobeStats.leastWorn
                .slice(0, 5)
                .map((item, index) => (
                  <div
                    className="insight-item"
                    key={item._id}
                  >
                    <span className="rank">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <div className="insight-item-image">
                      <ImageOrPlaceholder
                        src={item.image_url}
                        alt={item.subcategory}
                        className="item-image"
                        placeholder="ITEM"
                      />
                    </div>

                    <div className="insight-item-copy">
                      <strong>
                        {item.primary_color}{" "}
                        {item.subcategory}
                      </strong>
                      <span>
                        {item.style}
                      </span>
                    </div>

                    <strong className="wear-number muted">
                      {item.times_worn}×
                    </strong>
                  </div>
                ))}
            </div>
          </section>
        </div>

        <div className="future-feature-card">
          <div className="future-feature-icon">
            ✦
          </div>

          <div>
            <span className="eyebrow">
              COMING NEXT
            </span>

            <h3>
              Discover what your wardrobe
              is missing.
            </h3>

            <p>
              Soon, your stylist will be able
              to identify individual pieces
              that could unlock new
              combinations from the clothes
              you already own.
            </p>
          </div>

          <span className="future-badge">
            Unlock Engine
          </span>
        </div>
      </div>
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Profile Screen                                                         */
  /* ---------------------------------------------------------------------- */

  const renderProfile = () => {
    return (
      <div className="screen">
        <div className="profile-layout">
          <section className="profile-card profile-main">
            <div className="profile-avatar-large">
              A
            </div>

            <span className="eyebrow">
              YOUR STYLE PROFILE
            </span>

            <h2>Akhil</h2>

            <p>
              Your personal fashion profile
              is built from the wardrobe you
              actually own.
            </p>

            <div className="profile-stats">
              <div>
                <strong>
                  {wardrobe.length}
                </strong>
                <span>Items</span>
              </div>

              <div>
                <strong>
                  {outfitHistory.length}
                </strong>
                <span>Outfits</span>
              </div>

              <div>
                <strong>
                  {wardrobeStats.totalWears}
                </strong>
                <span>Wears</span>
              </div>
            </div>
          </section>

          <section className="profile-card">
            <div className="card-heading">
              <div>
                <span className="eyebrow">
                  STYLE PREFERENCES
                </span>

                <h3>
                  What your wardrobe says
                </h3>
              </div>
            </div>

            <div className="preference-group">
              <span>Dominant style</span>
              <div className="preference-value">
                {wardrobeStats.topStyle}
              </div>
            </div>

            <div className="preference-group">
              <span>Most common colour</span>
              <div className="preference-value">
                {wardrobeStats.topColor}
              </div>
            </div>

            <div className="preference-group">
              <span>Wardrobe size</span>
              <div className="preference-value">
                {wardrobe.length} pieces
              </div>
            </div>
          </section>
        </div>

        <section className="settings-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">
                STYLIST SETTINGS
              </span>

              <h3>
                How your stylist should behave
              </h3>
            </div>
          </div>

          <div className="setting-row">
            <div>
              <strong>
                Prioritize less-worn items
              </strong>

              <span>
                Give underused clothes more
                opportunities.
              </span>
            </div>

            <div className="toggle active">
              <span />
            </div>
          </div>

          <div className="setting-row">
            <div>
              <strong>
                Avoid repeated outfits
              </strong>

              <span>
                Reduce recommendations you've
                recently worn.
              </span>
            </div>

            <div className="toggle active">
              <span />
            </div>
          </div>

          <div className="setting-row">
            <div>
              <strong>
                Explain recommendations
              </strong>

              <span>
                Show why an outfit works.
              </span>
            </div>

            <div className="toggle active">
              <span />
            </div>
          </div>
        </section>

        <div className="profile-footer-note">
          <span>✦</span>
          Your stylist gets smarter as you
          use your wardrobe.
        </div>
      </div>
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  const renderScreen = () => {
    switch (screen) {
      case "today":
        return renderToday();

      case "wardrobe":
        return renderWardrobe();

      case "history":
        return renderHistory();

      case "insights":
        return renderInsights();

      case "profile":
        return renderProfile();

      case "home":
      default:
        return renderHome();
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        screen={screen}
        setScreen={setScreen}
      />

      <main className="main-content">
        <TopBar
          title={screenMeta[screen].title}
          subtitle={
            screenMeta[screen].subtitle
          }
        />

        {renderScreen()}
      </main>
    {selectedWardrobeItem && (
      <div
        className="item-details-overlay"
        onClick={() => setSelectedWardrobeItem(null)}
      >
        <div
          className="item-details-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="item-details-close"
            onClick={() => setSelectedWardrobeItem(null)}
          >
            ×
          </button>

          <div className="item-details-image">
            {selectedWardrobeItem.image_url ? (
              <img
                src={selectedWardrobeItem.image_url}
                alt={
                  selectedWardrobeItem.subcategory ||
                  selectedWardrobeItem.category ||
                  "Clothing item"
                }
              />
            ) : (
              <div className="item-image-placeholder">
                No image
              </div>
            )}
          </div>

          <div className="item-details-content">
            <div className="item-details-heading">
              <h2>
                {selectedWardrobeItem.subcategory ||
                  selectedWardrobeItem.category ||
                  "Clothing Item"}
              </h2>

              <span>
                {selectedWardrobeItem.style || "Personal style"}
              </span>
            </div>

            <div className="item-details-grid">
              <div>
                <label>Category</label>
                <strong>
                  {selectedWardrobeItem.category || "—"}
                </strong>
              </div>

              <div>
                <label>Colour</label>
                <strong>
                  {selectedWardrobeItem.primary_color || "—"}
                </strong>
              </div>

              <div>
                <label>Pattern</label>
                <strong>
                  {selectedWardrobeItem.pattern || "—"}
                </strong>
              </div>

              <div>
                <label>Occasion</label>
                <strong>
                  {selectedWardrobeItem.occasion || "—"}
                </strong>
              </div>

              <div>
                <label>Times worn</label>
                <strong>
                  {selectedWardrobeItem.times_worn ?? 0}
                </strong>
              </div>
            </div>

            <div className="item-details-actions">
              <button
                className="item-action edit"
                onClick={() => {
                  setEditImageFile(null);

                  setEditImagePreview(
                    selectedWardrobeItem.image_url ||
                      null
                  );

                  setEditingWardrobeItem(
                    selectedWardrobeItem
                  );
                }}
              >
                ✎ Edit
              </button>

              <button
                className="item-action delete"
                onClick={() => {
                  setDeleteConfirmItem(selectedWardrobeItem);
                }}
              >
                🗑 Delete
              </button>

              <button
                className="item-action use-outfit"
                onClick={() => {
                  console.log(
                    "Use in outfit:",
                    selectedWardrobeItem._id
                  );

                  setSelectedWardrobeItem(null);
                  console.log("Use in outfit is reserved for a later step.");
                }}
              >
                + Use in Outfit
              </button>
            </div>
          </div>
        </div>
      </div>
    )} 
    {editingWardrobeItem && (
      <div
        className="item-details-overlay"
        onClick={() => setEditingWardrobeItem(null)}
      >
        <div
          className="edit-item-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="item-details-close"
            onClick={() => setEditingWardrobeItem(null)}
          >
            ×
          </button>

          <div className="edit-item-header">
            <h2>Edit Clothing</h2>
            <p>
              Update the details of this wardrobe item.
            </p>
          </div>

          <div className="edit-item-form">
            <div className="edit-image-section">
              <label>Clothing Image</label>

              <label className="edit-image-upload">
                {editImagePreview ? (
                  <img
                    src={editImagePreview}
                    alt={
                      editingWardrobeItem.subcategory ||
                      "Clothing preview"
                    }
                  />
                ) : (
                  <div className="edit-image-empty">
                    <span>+</span>

                    <strong>
                      Upload Image
                    </strong>

                    <small>
                      Add a photo of this item
                    </small>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleEditImageChange
                  }
                  disabled={
                    editImageUploading
                  }
                />
              </label>

              {editImagePreview && (
                <label className="edit-change-image-button">
                  Change Image

                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handleEditImageChange
                    }
                    disabled={
                      editImageUploading
                    }
                  />
                </label>
              )}
            </div>
            <div className="edit-field">
              <label>Category</label>
              <input
                value={editingWardrobeItem.category || ""}
                onChange={(e) =>
                  setEditingWardrobeItem({
                    ...editingWardrobeItem,
                    category: e.target.value,
                  })
                }
              />
            </div>

            <div className="edit-field">
              <label>Subcategory</label>
              <input
                value={
                  editingWardrobeItem.subcategory || ""
                }
                onChange={(e) =>
                  setEditingWardrobeItem({
                    ...editingWardrobeItem,
                    subcategory: e.target.value,
                  })
                }
              />
            </div>

            <div className="edit-field">
              <label>Primary Colour</label>
              <input
                value={
                  editingWardrobeItem.primary_color || ""
                }
                onChange={(e) =>
                  setEditingWardrobeItem({
                    ...editingWardrobeItem,
                    primary_color: e.target.value,
                  })
                }
              />
            </div>

            <div className="edit-field">
              <label>Secondary Colour</label>
              <input
                value={
                  editingWardrobeItem.secondary_color || ""
                }
                onChange={(e) =>
                  setEditingWardrobeItem({
                    ...editingWardrobeItem,
                    secondary_color: e.target.value,
                  })
                }
              />
            </div>

            <div className="edit-field">
              <label>Pattern</label>
              <input
                value={editingWardrobeItem.pattern || ""}
                onChange={(e) =>
                  setEditingWardrobeItem({
                    ...editingWardrobeItem,
                    pattern: e.target.value,
                  })
                }
              />
            </div>

            <div className="edit-field">
              <label>Style</label>
              <input
                value={editingWardrobeItem.style || ""}
                onChange={(e) =>
                  setEditingWardrobeItem({
                    ...editingWardrobeItem,
                    style: e.target.value,
                  })
                }
              />
            </div>

            <div className="edit-field">
              <label>Occasion</label>
              <input
                value={
                  editingWardrobeItem.occasion || ""
                }
                onChange={(e) =>
                  setEditingWardrobeItem({
                    ...editingWardrobeItem,
                    occasion: e.target.value,
                  })
                }
              />
            </div>

            <div className="edit-field">
              <label>Times Worn</label>
              <input
                type="number"
                min="0"
                value={
                  editingWardrobeItem.times_worn ?? 0
                }
                onChange={(e) =>
                  setEditingWardrobeItem({
                    ...editingWardrobeItem,
                    times_worn: Number(e.target.value),
                  })
                }
              />
            </div>

          </div>

          <div className="edit-item-actions">
            <button
              className="edit-cancel-button"
              onClick={() =>
                setEditingWardrobeItem(null)
              }
            >
              Cancel
            </button>

            <button
              className="edit-save-button"
              onClick={() => {
                void handleUpdateWardrobeItem(
                  editingWardrobeItem
                );
              }}
              disabled={editImageUploading}
            >
              {editImageUploading
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    )}
    {deleteConfirmItem && (
    <div
      className="delete-confirm-overlay"
      onClick={() => setDeleteConfirmItem(null)}
    >
      <div
        className="delete-confirm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="delete-confirm-icon">
          🗑
        </div>

        <div className="delete-confirm-content">
          <h2>Delete this item?</h2>

          <p>
            Are you sure you want to remove{" "}
            <strong>
              {deleteConfirmItem.subcategory ||
                deleteConfirmItem.category ||
                "this item"}
            </strong>{" "}
            from your wardrobe?
          </p>

          <span className="delete-confirm-warning">
            This action cannot be undone.
          </span>
        </div>

        <div className="delete-confirm-actions">
          <button
            className="delete-cancel-button"
            onClick={() =>
              setDeleteConfirmItem(null)
            }
          >
            Cancel
          </button>

          <button
            className="delete-confirm-button"
            onClick={() => {
              void handleDeleteWardrobeItem(
                deleteConfirmItem
              );
            }}
          >
            Delete Item
          </button>
        </div>
      </div>
    </div>
  )}
  {showAddClothing && (
    <div
      className="add-clothing-overlay"
      onClick={() => {
        if (!addClothingLoading) {
          setShowAddClothing(false);
        }
      }}
    >
      <div
        className="add-clothing-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <button
          className="add-clothing-close"
          onClick={() => {
            if (!addClothingLoading) {
              setShowAddClothing(false);
            }
          }}
        >
          ×
        </button>

        <div className="add-clothing-header">
          <span className="eyebrow">
            YOUR WARDROBE
          </span>

          <h2>Add Clothing</h2>

          <p>
            Add a piece to your digital wardrobe.
          </p>
        </div>

        <div className="add-clothing-form">

          {/* IMAGE ---------------------------------------------------- */}

          <div className="add-image-section">
            <label>Clothing Image</label>

            <label className="add-image-upload">
              {addClothingPreview ? (
                <img
                  src={addClothingPreview}
                  alt="Clothing preview"
                />
              ) : (
                <div className="add-image-empty">
                  <span>+</span>
                  <strong>
                    Upload image
                  </strong>
                  <small>
                    JPG, PNG or WEBP
                  </small>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={
                  handleAddClothingImage
                }
                disabled={
                  addClothingLoading
                }
              />
            </label>

            {addClothingPreview && (
              <button
                type="button"
                className="remove-image-button"
                onClick={() => {
                  setAddClothingImage(null);
                  setAddClothingPreview(null);
                }}
              >
                Remove image
              </button>
            )}
          </div>

          {/* CATEGORY ----------------------------------------------- */}

          <div className="add-clothing-fields">

            <div className="add-field">
              <label>
                Category *
              </label>

              <select
                value={
                  newClothing.category
                }
                onChange={(e) =>
                  setNewClothing({
                    ...newClothing,
                    category:
                      e.target.value,
                  })
                }
              >
                <option value="topwear">
                  Topwear
                </option>

                <option value="bottomwear">
                  Bottomwear
                </option>

                <option value="footwear">
                  Footwear
                </option>
              </select>
            </div>

            {/* SUBCATEGORY ------------------------------------------ */}

            <div className="add-field">
              <label>
                Subcategory *
              </label>

              <input
                type="text"
                placeholder={
                  newClothing.category ===
                  "topwear"
                    ? "e.g. T-shirt"
                    : newClothing.category ===
                      "bottomwear"
                    ? "e.g. Jeans"
                    : "e.g. Sneakers"
                }
                value={
                  newClothing.subcategory
                }
                onChange={(e) =>
                  setNewClothing({
                    ...newClothing,
                    subcategory:
                      e.target.value,
                  })
                }
              />
            </div>

            {/* PRIMARY COLOUR -------------------------------------- */}

            <div className="add-field">
              <label>
                Primary Colour *
              </label>

              <input
                type="text"
                placeholder="e.g. Black"
                value={
                  newClothing.primary_color
                }
                onChange={(e) =>
                  setNewClothing({
                    ...newClothing,
                    primary_color:
                      e.target.value,
                  })
                }
              />
            </div>

            {/* SECONDARY COLOUR ------------------------------------ */}

            <div className="add-field">
              <label>
                Secondary Colour
              </label>

              <input
                type="text"
                placeholder="Optional"
                value={
                  newClothing.secondary_color
                }
                onChange={(e) =>
                  setNewClothing({
                    ...newClothing,
                    secondary_color:
                      e.target.value,
                  })
                }
              />
            </div>

            {/* PATTERN ---------------------------------------------- */}

            <div className="add-field">
              <label>Pattern *</label>

              <select
                value={
                  newClothing.pattern
                }
                onChange={(e) =>
                  setNewClothing({
                    ...newClothing,
                    pattern:
                      e.target.value,
                  })
                }
              >
                <option value="solid">
                  Solid
                </option>

                <option value="striped">
                  Striped
                </option>

                <option value="checked">
                  Checked
                </option>

                <option value="printed">
                  Printed
                </option>

                <option value="graphic">
                  Graphic
                </option>

                <option value="floral">
                  Floral
                </option>
              </select>
            </div>

            {/* STYLE ------------------------------------------------ */}

            <div className="add-field">
              <label>Style *</label>

              <select
                value={
                  newClothing.style
                }
                onChange={(e) =>
                  setNewClothing({
                    ...newClothing,
                    style:
                      e.target.value,
                  })
                }
              >
                <option value="casual">
                  Casual
                </option>

                <option value="formal">
                  Formal
                </option>

                <option value="smart casual">
                  Smart Casual
                </option>

                <option value="streetwear">
                  Streetwear
                </option>

                <option value="sporty">
                  Sporty
                </option>

                <option value="traditional">
                  Traditional
                </option>
              </select>
            </div>

            {/* OCCASION --------------------------------------------- */}

            <div className="add-field">
              <label>Occasion *</label>

              <select
                value={
                  newClothing.occasion
                }
                onChange={(e) =>
                  setNewClothing({
                    ...newClothing,
                    occasion:
                      e.target.value,
                  })
                }
              >
                <option value="casual">
                  Casual
                </option>

                <option value="college">
                  College
                </option>

                <option value="formal">
                  Formal
                </option>

                <option value="party">
                  Party
                </option>

                <option value="sports">
                  Sports
                </option>
              </select>
            </div>

            {/* SEASON ------------------------------------------------ */}

            <div className="add-field">
              <label>Season</label>

              <select
                value={
                  newClothing.season
                }
                onChange={(e) =>
                  setNewClothing({
                    ...newClothing,
                    season:
                      e.target.value,
                  })
                }
              >
                <option value="all">
                  All Seasons
                </option>

                <option value="summer">
                  Summer
                </option>

                <option value="winter">
                  Winter
                </option>

                <option value="monsoon">
                  Monsoon
                </option>
              </select>
            </div>

          </div>
        </div>

        {/* ACTIONS ---------------------------------------------------- */}

        <div className="add-clothing-actions">

          <button
            type="button"
            className="add-cancel-button"
            onClick={() => {
              if (!addClothingLoading) {
                setShowAddClothing(false);
              }
            }}
            disabled={
              addClothingLoading
            }
          >
            Cancel
          </button>

          <button
            type="button"
            className="add-save-button"
            onClick={() => {
              void handleAddClothing();
            }}
            disabled={
              addClothingLoading
            }
          >
            {addClothingLoading
              ? "Adding..."
              : "Add to Wardrobe"}
          </button>

        </div>
      </div>
    </div>
  )}
    </div>
  );
}


export default App;