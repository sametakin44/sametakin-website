export interface Project {
  id: string;
  title: string;
  tag: string;
  summary: string;
  subtitle: string;
  href?: string;
}

export const projects: Project[] = [
  {
    id: 'havelsan-pipeline',
    title: 'pdf → fine-tuning dataset pipeline',
    tag: 'generative ai',
    summary:
      'pdf dokümanlarını domain-spesifik fine-tuning veri setlerine çeviren çok-threadli bir pipeline kurdum. fastapi backend\'i gradio arayüzle entegre ettim, ardından ürettiğimiz veriyle dil modellerini fine-tune ettik.',
    subtitle: 'havelsan main ai center · 2025',
  },
  {
    id: 'havelsan-chatbot',
    title: 'sql veritabanı üzerinde agentic chatbot',
    tag: 'agentic ai',
    summary:
      'gerçek bir veritabanı mimarisini taklit eden deneysel bir sql şemasının üstünde, reason-act ajan mantığıyla konuşan bir chatbot akışı tasarladım. sentetik sql verisiyle uçtan uca test edildi.',
    subtitle: 'havelsan main ai center · 2025',
  },
  {
    id: 'newmind-rag',
    title: 'hukuk alanı agentic rag analizi',
    tag: 'agentic rag',
    summary:
      'knowledge graph + elasticsearch + qdrant bileşenlerinden oluşan hukuk domaininde bir agentic chatbotu inceledim; darboğazları tespit edip ajan davranışını daha güvenilir kılacak mimari iyileştirmeler önerdim.',
    subtitle: 'newmind ai · maslak · 2025',
  },
  {
    id: 'tubitak-abr',
    title: 'abr sinyallerinde wave tespiti (tübitak 1001)',
    tag: 'research · signal processing',
    summary:
      'işitme beyin sapı yanıtlarında v. dalganın varlığını ve konumunu transformer tabanlı modellerle tespit ettim. vae ile sentetik abr üretip snik / itik / normal sınıflarında işitme kaybı türü sınıflandırması denedim.',
    subtitle: 'medipol · prof. dr. bahadır kürşat güntürk · 2024→',
  },
  {
    id: 'bilgem-rag',
    title: 'multi-agent rag sistemi (db + web ajanları)',
    tag: 'rag',
    summary:
      'chunking stratejilerini (fixed, semantic, late) ve farklı embedding modellerini karşılaştırdım. react kontrol ajanı altında veritabanı ve web-arama ajanlarıyla multi-query generation kullanarak halüsinasyonu düşürdüm; graphrag ile klasik rag\'i de kıyasladım.',
    subtitle: 'tübitak bilgem · gebze · 2024',
  },
  {
    id: 'bilgem-cv',
    title: 'meyve sınıflandırma + yolov5/yolov8 tespiti',
    tag: 'computer vision',
    summary:
      'vgg16, resnet ve özel cnn modelleri ile meyve sınıflandırma yaptım. dall-e ile ürettiğim sentetik arka planları opencv ile gerçek meyve fotoğraflarıyla birleştirip, aynı veriyle yolov5 ve yolov8 üzerinden nesne tespiti değerlendirmesi yaptım.',
    subtitle: 'tübitak bilgem · gebze · 2023',
  },
];
