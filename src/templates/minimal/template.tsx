import { TemplateData } from "../types";
import { ALLERGENS } from "@/types/menu";

export function MinimalTemplate({ data }: { data: TemplateData }) {
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
        backgroundColor: "#FFFFFF",
        color: text,
        fontFamily: body,
        padding: "3rem 2rem",
      }}
    >
      {/* Header - minimal, left-aligned */}
      <div style={{ marginBottom: "3rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            {restaurant.logoUrl && (
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                style={{ height: 36, width: "auto", marginBottom: "0.75rem" }}
              />
            )}
            <h1
              style={{
                fontFamily: heading,
                fontSize: "1.75rem",
                fontWeight: 700,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              {restaurant.name}
            </h1>
          </div>
          {restaurant.phone && (
            <span
              style={{
                fontSize: "0.75rem",
                opacity: 0.35,
                fontWeight: 500,
              }}
            >
              {restaurant.phone}
            </span>
          )}
        </div>
        {restaurant.address && (
          <p
            style={{
              fontSize: "0.75rem",
              opacity: 0.35,
              marginTop: "0.25rem",
              fontWeight: 400,
            }}
          >
            {restaurant.address}
          </p>
        )}
        {/* Thin accent line */}
        <div
          style={{
            width: 32,
            height: 2,
            backgroundColor: primary,
            marginTop: "1.25rem",
          }}
        />
      </div>

      {/* Categories */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        {menu.categories.map((category, catIdx) => (
          <div key={catIdx}>
            {/* Category name */}
            <h3
              style={{
                fontFamily: body,
                fontSize: "0.65rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.25em",
                opacity: 0.35,
                marginBottom: "1.25rem",
                paddingBottom: "0.5rem",
                borderBottom: `1px solid ${text}10`,
              }}
            >
              {category.name}
            </h3>
            {category.description && (
              <p
                style={{
                  fontSize: "0.78rem",
                  opacity: 0.35,
                  marginTop: "-0.75rem",
                  marginBottom: "1rem",
                  fontStyle: "italic",
                }}
              >
                {category.description}
              </p>
            )}

            {/* Dishes */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
            >
              {category.dishes
                .filter((d) => d.isAvailable)
                .map((dish, dishIdx) => (
                  <div key={dishIdx}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: "1.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {dish.name}
                      </span>
                      <span
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          color: primary,
                          flexShrink: 0,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {dish.price}
                      </span>
                    </div>
                    {dish.description && (
                      <p
                        style={{
                          fontSize: "0.78rem",
                          opacity: 0.4,
                          marginTop: "0.2rem",
                          lineHeight: 1.5,
                          maxWidth: "85%",
                        }}
                      >
                        {dish.description}
                      </p>
                    )}
                    {dish.allergens.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: "0.35rem",
                          marginTop: "0.4rem",
                          flexWrap: "wrap",
                        }}
                      >
                        {dish.allergens.map((a) => {
                          const allergen = ALLERGENS.find((al) => al.id === a);
                          return (
                            <span
                              key={a}
                              style={{
                                fontSize: "0.6rem",
                                fontWeight: 500,
                                padding: "0.15rem 0.5rem",
                                borderRadius: 2,
                                backgroundColor: `${primary}10`,
                                color: `${text}80`,
                                letterSpacing: "0.02em",
                              }}
                            >
                              {allergen?.label ?? a}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Allergen legend */}
      {usedAllergens.size > 0 && (
        <p
          style={{
            marginTop: "3rem",
            fontSize: "0.6rem",
            opacity: 0.25,
            lineHeight: 1.6,
          }}
        >
          Allergènes :{" "}
          {ALLERGENS.filter((a) => usedAllergens.has(a.id))
            .map((a) => a.label)
            .join(", ")}
        </p>
      )}

      {/* Watermark */}
      {branding.showWatermark && (
        <p
          style={{
            fontSize: "0.55rem",
            opacity: 0.15,
            marginTop: "1.5rem",
          }}
        >
          Créé avec Menufique
        </p>
      )}
    </div>
  );
}
