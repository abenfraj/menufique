import { TemplateData } from "../types";
import { ALLERGENS } from "@/types/menu";

export function BistrotTemplate({ data }: { data: TemplateData }) {
  const { restaurant, menu, customization, branding } = data;
  const usedAllergens = new Set(
    menu.categories.flatMap((cat) =>
      cat.dishes.flatMap((dish) => dish.allergens)
    )
  );

  const accent = customization.primaryColor;
  const heading = customization.headingFont;
  const body = customization.bodyFont;

  // Bistrot = dark warm background
  const bgColor = "#1C1410";
  const textColor = "#F2E8DC";
  const subtleColor = "#A89279";

  return (
    <div
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: body,
        padding: "2.5rem 2rem",
        borderRadius: 12,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            ${textColor} 2px,
            ${textColor} 3px
          )`,
          pointerEvents: "none",
        }}
      />

      {/* Inner decorative border */}
      <div
        style={{
          border: `1px solid ${subtleColor}30`,
          borderRadius: 8,
          padding: "2rem 1.5rem",
          position: "relative",
        }}
      >
        {/* Corner ornaments */}
        {["top-left", "top-right", "bottom-left", "bottom-right"].map(
          (pos) => {
            const isTop = pos.includes("top");
            const isLeft = pos.includes("left");
            return (
              <div
                key={pos}
                style={{
                  position: "absolute",
                  [isTop ? "top" : "bottom"]: -1,
                  [isLeft ? "left" : "right"]: -1,
                  width: 16,
                  height: 16,
                  borderTop: isTop ? `2px solid ${accent}60` : "none",
                  borderBottom: !isTop ? `2px solid ${accent}60` : "none",
                  borderLeft: isLeft ? `2px solid ${accent}60` : "none",
                  borderRight: !isLeft ? `2px solid ${accent}60` : "none",
                }}
              />
            );
          }
        )}

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          {restaurant.logoUrl && (
            <img
              src={restaurant.logoUrl}
              alt={restaurant.name}
              style={{
                height: 56,
                width: "auto",
                margin: "0 auto 1rem",
                display: "block",
                filter: "brightness(1.2)",
              }}
            />
          )}
          <h1
            style={{
              fontFamily: heading,
              fontSize: "2rem",
              fontWeight: 700,
              color: accent,
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: "0.03em",
            }}
          >
            {restaurant.name}
          </h1>

          {/* Ornamental divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              margin: "0.75rem 0",
            }}
          >
            <div
              style={{
                height: 1,
                width: 50,
                background: `linear-gradient(90deg, transparent, ${subtleColor}60)`,
              }}
            />
            <span style={{ color: accent, fontSize: "0.8rem" }}>◆</span>
            <div
              style={{
                height: 1,
                width: 50,
                background: `linear-gradient(90deg, ${subtleColor}60, transparent)`,
              }}
            />
          </div>

          {restaurant.address && (
            <p
              style={{
                fontSize: "0.75rem",
                color: subtleColor,
                letterSpacing: "0.05em",
              }}
            >
              {restaurant.address}
            </p>
          )}
        </div>

        {/* Menu title */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            padding: "0.5rem 0",
            borderTop: `1px solid ${subtleColor}20`,
            borderBottom: `1px solid ${subtleColor}20`,
          }}
        >
          <h2
            style={{
              fontFamily: heading,
              fontSize: "1rem",
              fontStyle: "italic",
              fontWeight: 400,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: subtleColor,
              margin: 0,
            }}
          >
            {menu.name}
          </h2>
        </div>

        {/* Categories */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}
        >
          {menu.categories.map((category, catIdx) => (
            <div key={catIdx}>
              {/* Category header */}
              <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                <h3
                  style={{
                    fontFamily: heading,
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: accent,
                    margin: 0,
                    letterSpacing: "0.1em",
                  }}
                >
                  {category.name}
                </h3>
                {category.description && (
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontStyle: "italic",
                      color: subtleColor,
                      marginTop: "0.3rem",
                    }}
                  >
                    {category.description}
                  </p>
                )}
              </div>

              {/* Dishes */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {category.dishes
                  .filter((d) => d.isAvailable)
                  .map((dish, dishIdx) => (
                    <div key={dishIdx} style={{ textAlign: "center" }}>
                      {/* Dish name + price */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          justifyContent: "center",
                          gap: "0.75rem",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {dish.name}
                        </span>
                        <span
                          style={{
                            fontWeight: 700,
                            color: accent,
                            fontSize: "0.95rem",
                          }}
                        >
                          {dish.price}
                        </span>
                      </div>
                      {/* Description */}
                      {dish.description && (
                        <p
                          style={{
                            fontSize: "0.75rem",
                            fontStyle: "italic",
                            color: subtleColor,
                            marginTop: "0.15rem",
                            lineHeight: 1.4,
                          }}
                        >
                          {dish.description}
                        </p>
                      )}
                      {/* Allergens */}
                      {dish.allergens.length > 0 && (
                        <p
                          style={{
                            fontSize: "0.6rem",
                            color: `${subtleColor}80`,
                            marginTop: "0.2rem",
                          }}
                        >
                          {dish.allergens
                            .map((a) => {
                              const al = ALLERGENS.find((x) => x.id === a);
                              return al?.label ?? a;
                            })
                            .join(" · ")}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Allergen legend */}
        {usedAllergens.size > 0 && (
          <div
            style={{
              marginTop: "2.5rem",
              paddingTop: "0.75rem",
              borderTop: `1px solid ${subtleColor}20`,
              textAlign: "center",
              fontSize: "0.6rem",
              color: `${subtleColor}60`,
              lineHeight: 1.6,
            }}
          >
            Allergènes :{" "}
            {ALLERGENS.filter((a) => usedAllergens.has(a.id))
              .map((a) => a.label)
              .join(" · ")}
          </div>
        )}

        {/* Contact */}
        {restaurant.phone && (
          <p
            style={{
              textAlign: "center",
              fontSize: "0.7rem",
              color: subtleColor,
              marginTop: "1.25rem",
              letterSpacing: "0.05em",
            }}
          >
            Réservations : {restaurant.phone}
          </p>
        )}

        {/* Watermark */}
        {branding.showWatermark && (
          <p
            style={{
              textAlign: "center",
              fontSize: "0.55rem",
              opacity: 0.15,
              marginTop: "1rem",
              color: textColor,
            }}
          >
            Créé avec Menufique
          </p>
        )}
      </div>
    </div>
  );
}
