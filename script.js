async function download() {
  const svgElement = document.getElementById("comic");

  // Fonction pour convertir les images référencées en base64
  async function inlineImages(svg) {
    const images = svg.querySelectorAll("image");
    for (const img of images) {
      const href = img.getAttribute("href");
      if (href) {
        try {
          console.log("Tentative de chargement de l'image depuis l'URL:", href);
          const response = await fetch(href, {
            mode: "cors",
            headers: { "Access-Control-Allow-Origin": "*" },
          });
          const blob = await response.blob();
          const reader = new FileReader();
          await new Promise((resolve) => {
            reader.onloadend = () => {
              img.setAttribute("href", reader.result); // Remplacer href par la data URL
              resolve();
            };
            reader.readAsDataURL(blob);
          });
        } catch (err) {
          console.error(`Erreur lors de l'encodage de l'image ${href}:`, err);
        }
      }
    }
  }

  // Inclure les images dans le SVG avant conversion
  await inlineImages(svgElement);

  // Convertir le SVG en chaîne
  const svgString = new XMLSerializer().serializeToString(svgElement);

  // Créer une URL pour l'image
  const svgBlob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svgBlob);

  // Charger l'image dans un canvas
  const img = new Image();
  img.onload = async function () {
    const canvas = document.createElement("canvas");
    canvas.width = svgElement.viewBox.baseVal.width;
    canvas.height = svgElement.viewBox.baseVal.height;
    const ctx = canvas.getContext("2d");

    // Dessiner le contenu du SVG sur le canvas
    const svgImg = new Image();
    svgImg.src = url;

    svgImg.onload = function () {
      // Dessiner l'image SVG entière sur le canvas
      ctx.drawImage(svgImg, 0, 0);

      // Convertir le canvas en PNG
      canvas.toBlob(async (blob) => {
        try {
          // Copier l'image dans le presse-papier
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          alert("Image copiée dans le presse-papier !");
        } catch (err) {
          console.error("Erreur lors de la copie : ", err);
          alert("Impossible de copier l'image.");
        }
      }, "image/png");
    };
  };

  // Assurez-vous que l'image référencée est bien chargée
  img.src = url;
}

function addTexte(content) {
  if (content === "") {
    return;
  }
  const previousTexte = document.getElementById("groupText");
  if (previousTexte) {
    previousTexte.remove();
  }
  const pieces = content.split("\n");
  const start = { x: 100, y: 50 };
  const svg = document.getElementById("comic");
  var group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.id = "groupText";
  for (const i of pieces) {
    var texte = document.createElementNS("http://www.w3.org/2000/svg", "text");
    texte.textContent = i;
    texte.setAttribute("x", start.x);
    texte.setAttribute("y", start.y);
    texte.setAttribute("stroke", "black");
    texte.setAttribute("stroke-width", "0.5");
    texte.style.fontFamily = "anime";
    texte.style.fontSize = "14px";
    texte.setAttribute("fill", "black");
    group.appendChild(texte);
    start.y += 25;
  }
  svg.appendChild(group);
}

function generate() {
  const value = document.getElementById("content");
  addTexte(value.value);
}

window.onload = function () {
  setInterval(generate, 100);
};
