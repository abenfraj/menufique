import { TemplateData } from "../types";
import { ALLERGENS } from "@/types/menu";

export function ClassicTemplate({ data }: { data: TemplateData }) {
  const { restaurant, menu, customization, branding } = data;
  const usedAllergens = new Set(
    menu.categories.flatMap((cat) =>
      cat.dishes.flatMap((dish) => dish.allergens)
    )
  );

  const primary = customization.primaryColor;
  const text = customization.textColor;
  const heading = customization.headingFont;
  const body = customization.bodyFont;

  return (
    <div
      style={{
        backgroundColor: customization.backgroundColor,
        color: text,
        fontFamily: body,
        padding: "2.5rem 2rem",
      }}
    >
      {/* Ornamental top border */}
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, transparent, ${primary}, transparent)`,
          marginBottom: "2rem",
        }}
      />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        {restaurant.logoUrl && (
          <img
            src={restaurant.logoUrl}
            alt={restaurant.name}
            style={{
              height: 64,
              width: "auto",
              margin: "0 auto 1rem",
              display: "block",
            }}
          />
        )}
        <h1
          style={{
            fontFamily: heading,
            fontSize: "2rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            color: primary,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {restaurant.name}
        </h1>
        {restaurant.address && (
          <p
            style={{
              fontSize: "0.8rem",
              opacity: 0.5,
              marginTop: "0.5rem",
              letterSpacing: "0.03em",
            }}
          >
            {restaurant.address}
          </p>
        )}
        {restaurant.phone && (
          <p style={{ fontSize: "0.8rem", opacity: 0.5, marginTop: "0.15rem" }}>
            {restaurant.phone}
          </p>
        )}
      </div>

      {/* Decorative divider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            height: 1,
            width: 60,
            backgroundColor: primary,
            opacity: 0.4,
          }}
        />
        <span style={{ color: primary, fontSize: "1.2rem", opacity: 0.6 }}>
          ❧
        </span>
        <div
          style={{
            height: 1,
            width: 60,
            backgroundColor: primary,
            opacity: 0.4,
          }}
        />
      </div>

      {/* Menu title */}
      <h2
        style={{
          textAlign: "center",
          fontFamily: heading,
          fontSize: "1.15rem",
          fontWeight: 600,
          fontStyle: "italic",
          marginBottom: "2rem",
          opacity: 0.7,
        }}
      >
        — {menu.name} —
      </h2>

      {/* Categories */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        {menu.categories.map((category, catIdx) => (
          <div key={catIdx}>
            {/* Category header */}
            <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
              <h3
                style={{
                  fontFamily: heading,
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: primary,
                  margin: 0,
                }}
              >
                {category.name}
              </h3>
              {category.description && (
                <p
                  style={{
                    fontSize: "0.8rem",
                    fontStyle: "italic",
                    opacity: 0.5,
                    marginTop: "0.35rem",
                  }}
                >
                  {category.description}
                </p>
              )}
              <div
                style={{
                  width: 40,
                  height: 2,
                  backgroundColor: primary,
                  margin: "0.6rem auto 0",
                  borderRadius: 1,
                }}
              />
            </div>

            {/* Dishes */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {category.dishes
                .filter((d) => d.isAvailable)
                .map((dish, dishIdx) => (
                  <div key={dishIdx}>
                    {/* Name + dots + price row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 4,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          flexShrink: 0,
                        }}
                      >
                        {dish.name}
                      </span>
                      {dish.allergens.length > 0 && (
                        <sup
                          style={{
                            fontSize: "0.6rem",
                            opacity: 0.4,
                            flexShrink: 0,
                          }}
                        >
                          {dish.allergens
                            .map((a) => {
                              const idx = ALLERGENS.findIndex(
                                (al) => al.id === a
                              );
                              return idx + 1;
                            })
                            .join(",")}
                        </sup>
                      )}
                      <div
                        style={{
                          flex: 1,
                          borderBottom: `1px dotted ${text}25`,
                          minWidth: 20,
                          margin: "0 0.25rem",
                          alignSelf: "baseline",
                          position: "relative",
                          top: -3,
                        }}
                      />
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          color: primary,
                          flexShrink: 0,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {dish.price}
                      </span>
                    </div>
                    {/* Description */}
                    {dish.description && (
                      <p
                        style={{
                          fontSize: "0.78rem",
                          fontStyle: "italic",
                          opacity: 0.5,
                          marginTop: "0.15rem",
                          lineHeight: 1.4,
                          paddingRight: "3rem",
                        }}
                      >
                        {dish.description}
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
            paddingTop: "1rem",
            borderTop: `1px solid ${primary}20`,
            fontSize: "0.65rem",
            opacity: 0.45,
            lineHeight: 1.6,
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: "0.2rem" }}>
            Allergènes :
          </p>
          <p>
            {ALLERGENS.filter((a) => usedAllergens.has(a.id)).map((a, i) => {
              const idx = ALLERGENS.findIndex((al) => al.id === a.id);
              return (
                <span key={a.id}>
                  {i > 0 && " · "}
                  <strong>({idx + 1})</strong> {a.label}
                </span>
              );
            })}
          </p>
        </div>
      )}

      {/* Bottom ornament */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          marginTop: "2rem",
        }}
      >
        <div
          style={{
            height: 1,
            width: 40,
            backgroundColor: primary,
            opacity: 0.3,
          }}
        />
        <span style={{ color: primary, fontSize: "0.7rem", opacity: 0.4 }}>
          ✦
        </span>
        <div
          style={{
            height: 1,
            width: 40,
            backgroundColor: primary,
            opacity: 0.3,
          }}
        />
      </div>

      {/* Watermark */}
      {branding.showWatermark && (
        <p
          style={{
            textAlign: "center",
            fontSize: "0.6rem",
            opacity: 0.2,
            marginTop: "1rem",
          }}
        >
          Créé avec Menufique
        </p>
      )}
    </div>
  );
}
