import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "#";
const SUPABASE_ANON_KEY = "#";
const BUCKET_NAME = "imagens";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const gallery = document.getElementById("gallery");
const form = document.getElementById("upload-form");
const fileInput = document.getElementById("file-input");
const descInput = document.getElementById("desc-input");

async function loadImages () {
    const { data, error } = await supabase.from("galeria").select("*").order("created_at", { ascending: false});

    if (error) {
        console.error("É um erro ao buscar imagens:", error);
        return;
    }

    gallery.innerHTML = "";

    data.forEach(item => {
        const img = document.createElement("img");
        img.src = item.url;
        img.alt = item.descricao;
        img.title = item.descricao;

        const caption = document.createElement("p");
        caption.textContent = `📝 ${item.descricao}`;

        const containter = document.createElement("div");
        containter.appendChild(img);
        containter.appendChild(caption);
        gallery.appendChild(containter);
    });
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    const descricao = descInput.value.trim();

    if (!file || !descricao) {
        return alert("Oxi... preencha todos os campos.");
    }

    const fileName = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file);

    if (uploadError) {
        console.error("É um erro no upload:", uploadError);
        return alert("É um erro ao enviar a imagem.");
    }

    const { data: publicUrlData } = await supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

    const {error: insertError } = await supabase
    .from("galeria")
    .insert([{ url: publicUrlData.publicUrl, descricao }]);

    if (insertError) {
        console.error("É um erro ao salvar no banco:", insertError);
        return alert("É um erro ao salvar no banco de dados.");
    }

    fileInput.value = "";
    descInput.value = "";
    loadImages();    
});

loadImages();
