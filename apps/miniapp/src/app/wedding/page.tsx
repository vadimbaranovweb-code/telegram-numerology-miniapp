import Image from "next/image";

const timeline = [
  {
    time: "14:30",
    title: "Трансфер",
    description:
      "Для гостей из Самары предусмотрен трансфер от магазина «Русь» на Московском шоссе. Для гостей из Тольятти трансфер заберет всех по персональным адресам.",
  },
  {
    time: "15:00-15:30",
    title: "Сбор гостей",
    description:
      "Время, чтобы комфортно добраться, занять место и выпить бокал освежающего перед началом церемонии.",
  },
  {
    time: "16:00-16:30",
    title: "Выездная регистрация",
    description:
      "Регистрация с представителями ЗАГСа пройдет под открытым небом. Все гости смогут расположиться на комфортных креслах.",
  },
  {
    time: "16:30-23:00",
    title: "Банкет",
    description:
      "Вас ждет шоу-программа с ведущим, трогательные поздравления и вкусная еда в теплой загородной атмосфере.",
  },
  {
    time: "После 23:00",
    title: "Завершение вечера",
    description:
      "Для всех гостей предусмотрен обратный трансфер, чтобы путь домой был таким же комфортным, как и весь праздник.",
  },
];

const dressCodeColors = [
  { name: "Молочный", value: "#F4EEE4" },
  { name: "Песочный", value: "#D9C6A5" },
  { name: "Шоколадный", value: "#4B2E20" },
  { name: "Хвойный", value: "#243D28" },
];

const details = [
  {
    title: "Локация",
    text: "Праздник пройдет в загородном кафе «8 миля» — в атмосфере летнего вечера, природы и неспешного семейного тепла.",
  },
  {
    title: "Как добраться",
    text: "Для гостей мы предусмотрели удобный трансфер, чтобы вы могли наслаждаться днем без лишней логистики.",
  },
  {
    title: "Если будут вопросы",
    text: "По любым организационным вопросам можно написать в Telegram. Это же будет самым быстрым способом подтвердить участие.",
  },
];

const contactLink = "https://t.me/Knizhnik_KM";
const mapsLink =
  "https://yandex.ru/maps/?ll=49.558276%2C53.506958&mode=search&pt=49.558276%2C53.506958&text=53.506958%2C49.558276&z=15";

export const metadata = {
  title: "Константин и Мария — 5 июля 2026",
  description: "Свадебное приглашение Константина и Марии",
};

export default function WeddingPage() {
  return (
    <main className="min-h-screen bg-[#f6f0e8] text-[#2f221c]">
      <section className="relative overflow-hidden border-b border-[#d8cabc]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(244,238,228,0.9),_transparent_45%),linear-gradient(135deg,_rgba(54,40,30,0.08),_transparent_60%)]" />
        <div className="relative mx-auto grid min-h-screen max-w-7xl items-stretch gap-10 px-6 py-8 md:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:px-16 lg:py-12">
          <div className="flex flex-col justify-between gap-10 lg:py-8">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.32em] text-[#7e6858]">
              <span>Wedding day</span>
              <span>5 июля 2026</span>
            </div>

            <div className="max-w-xl">
              <p className="mb-4 text-sm uppercase tracking-[0.26em] text-[#8d7766]">
                Загородное кафе «8 миля»
              </p>
              <h1
                className="text-[56px] leading-[0.92] md:text-[84px] lg:text-[112px]"
                style={{
                  fontFamily:
                    '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Times New Roman", serif',
                }}
              >
                Константин
                <span className="block pl-[0.18em] text-[#907865]">&</span>
                <span className="block">Мария</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-[#5c473b] md:text-xl">
                Приглашаем вас разделить с нами день, наполненный любовью,
                летним светом и самыми важными людьми рядом.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href={contactLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#2f221c] px-7 py-4 text-sm font-medium text-[#f6f0e8] transition hover:bg-[#46342b]"
              >
                Подтвердить участие
              </a>
              <a
                href="#schedule"
                className="inline-flex items-center justify-center rounded-full border border-[#8d7766] px-7 py-4 text-sm font-medium text-[#2f221c] transition hover:bg-[#efe5da]"
              >
                Смотреть программу
              </a>
            </div>

            <div className="grid gap-5 border-t border-[#d8cabc] pt-6 text-sm text-[#6f5a4d] sm:grid-cols-3">
              <div>
                <p className="mb-2 uppercase tracking-[0.2em] text-[#947c6b]">
                  Дата
                </p>
                <p className="text-base text-[#2f221c]">5 июля 2026</p>
              </div>
              <div>
                <p className="mb-2 uppercase tracking-[0.2em] text-[#947c6b]">
                  Welcome
                </p>
                <p className="text-base text-[#2f221c]">15:00-15:30</p>
              </div>
              <div>
                <p className="mb-2 uppercase tracking-[0.2em] text-[#947c6b]">
                  Церемония
                </p>
                <p className="text-base text-[#2f221c]">16:00</p>
              </div>
            </div>
          </div>

          <div className="relative flex min-h-[460px] items-end overflow-hidden rounded-[32px] border border-[#d6c8bb] bg-[#d9cec4] shadow-[0_40px_120px_rgba(70,52,43,0.14)] lg:min-h-[760px]">
            <Image
              src="/wedding/hero.jpg"
              alt="Константин и Мария"
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(29,20,16,0.62)] via-[rgba(29,20,16,0.12)] to-transparent" />
            <div className="relative z-10 p-6 text-[#f7efe6] md:p-8">
              <p className="max-w-sm text-sm leading-6 text-[#eadfd3]">
                День, который мы хотим провести рядом с теми, кого любим
                сильнее всего.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-18 md:px-10 lg:px-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[#907865]">
              Приглашение
            </p>
            <h2
              className="max-w-md text-4xl leading-tight md:text-5xl"
              style={{
                fontFamily:
                  '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Times New Roman", serif',
              }}
            >
              Дорогие родные и друзья,
            </h2>
          </div>
          <div className="grid gap-6 text-lg leading-8 text-[#5c473b] md:text-xl">
            <p>
              Мы будем счастливы, если вы разделите с нами радость этого дня.
              Для нас особенно важно провести его в окружении близких людей, в
              красивой и теплой атмосфере.
            </p>
            <p>
              Мы мечтаем о дне, в котором будет много света, искренних улыбок и
              спокойного счастья. Очень ждем встречи с вами в загородном кафе
              «8 миля».
            </p>
          </div>
        </div>
      </section>

      <section
        id="schedule"
        className="border-y border-[#d8cabc] bg-[#efe6db]/70"
      >
        <div className="mx-auto max-w-7xl px-6 py-18 md:px-10 lg:px-16 lg:py-24">
          <div className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[#907865]">
                Тайминг дня
              </p>
              <h2
                className="text-4xl md:text-5xl"
                style={{
                  fontFamily:
                    '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Times New Roman", serif',
                }}
              >
                Программа праздника
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-[#6f5a4d]">
              Мы сделали день спокойным и комфортным: с продуманной логистикой,
              красивой регистрацией на свежем воздухе и длинным вечером рядом с
              любимыми людьми.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            {timeline.map((item, index) => (
              <article
                key={item.title}
                className="rounded-[28px] border border-[#d6c8bb] bg-[#f8f2eb] p-6 shadow-[0_18px_60px_rgba(70,52,43,0.07)]"
              >
                <p className="mb-8 text-sm uppercase tracking-[0.24em] text-[#907865]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mb-3 text-sm uppercase tracking-[0.2em] text-[#947c6b]">
                  {item.time}
                </p>
                <h3
                  className="mb-4 text-[30px] leading-tight"
                  style={{
                    fontFamily:
                      '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Times New Roman", serif',
                  }}
                >
                  {item.title}
                </h3>
                <p className="text-base leading-7 text-[#5c473b]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-18 md:px-10 lg:px-16 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative min-h-[420px] overflow-hidden rounded-[32px] border border-[#d6c8bb] bg-[#d9cec4] shadow-[0_40px_120px_rgba(70,52,43,0.12)]">
            <Image
              src="/wedding/portrait.jpg"
              alt="Портрет Константина и Марии"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(33,23,18,0.45)] to-transparent" />
          </div>

          <div className="grid gap-8">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[#907865]">
                Локация
              </p>
              <h2
                className="text-4xl md:text-5xl"
                style={{
                  fontFamily:
                    '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Times New Roman", serif',
                }}
              >
                Загородное кафе «8 миля»
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-8 text-[#5c473b]">
                Праздник пройдет за городом, среди летней зелени и вечернего
                света. Мы очень хотим, чтобы этот день был для вас красивым,
                легким и по-настоящему уютным.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-[#d6c8bb] bg-[#fbf7f1] p-6">
                <p className="mb-2 text-xs uppercase tracking-[0.24em] text-[#907865]">
                  Координаты
                </p>
                <p className="text-lg text-[#2f221c]">53.506958, 49.558276</p>
              </div>
              <div className="rounded-[24px] border border-[#d6c8bb] bg-[#fbf7f1] p-6">
                <p className="mb-2 text-xs uppercase tracking-[0.24em] text-[#907865]">
                  Трансфер
                </p>
                <p className="text-lg text-[#2f221c]">С 14:30 для гостей</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href={mapsLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#2f221c] px-7 py-4 text-sm font-medium text-[#f6f0e8] transition hover:bg-[#46342b]"
              >
                Открыть маршрут
              </a>
              <a
                href={contactLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-[#8d7766] px-7 py-4 text-sm font-medium text-[#2f221c] transition hover:bg-[#efe5da]"
              >
                Написать в Telegram
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#d8cabc] bg-[#fbf7f1]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-18 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-16 lg:py-24">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[#907865]">
              Dress code
            </p>
            <h2
              className="text-4xl md:text-5xl"
              style={{
                fontFamily:
                  '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Times New Roman", serif',
              }}
            >
              Палитра нашего дня
            </h2>
            <p className="mt-5 max-w-md text-lg leading-8 text-[#5c473b]">
              Нам будет особенно приятно, если в своих образах вы поддержите
              цветовую гамму нашего праздника. Подойдут спокойные природные
              оттенки, мягкие фактуры и элегантные силуэты.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-4">
              {dressCodeColors.map((color) => (
                <div
                  key={color.name}
                  className="rounded-[24px] border border-[#d6c8bb] bg-white p-4"
                >
                  <div
                    className="mb-4 h-24 rounded-[18px] border border-[#e3d7cb]"
                    style={{ backgroundColor: color.value }}
                  />
                  <p className="text-sm uppercase tracking-[0.18em] text-[#6f5a4d]">
                    {color.name}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-[28px] border border-[#d6c8bb] bg-[#efe6db] p-6 text-[#5c473b]">
              <p className="text-base leading-7">
                Если сомневаетесь в выборе образа, можно ориентироваться на
                светлые молочные, песочные, шоколадные и глубокие зеленые
                оттенки. Такой dress code поможет сохранить мягкую и гармоничную
                атмосферу праздника на фотографиях.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-18 md:px-10 lg:px-16 lg:py-24">
        <div className="mb-10">
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[#907865]">
            Важные детали
          </p>
          <h2
            className="text-4xl md:text-5xl"
            style={{
              fontFamily:
                '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Times New Roman", serif',
            }}
          >
            Чтобы день прошел легко
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {details.map((item) => (
            <article
              key={item.title}
              className="rounded-[28px] border border-[#d6c8bb] bg-[#fbf7f1] p-6"
            >
              <h3
                className="mb-4 text-[30px] leading-tight"
                style={{
                  fontFamily:
                    '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Times New Roman", serif',
                }}
              >
                {item.title}
              </h3>
              <p className="text-base leading-7 text-[#5c473b]">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-[#d8cabc] bg-[#2f221c] text-[#f6f0e8]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:px-10 lg:grid-cols-[1fr_auto] lg:items-end lg:px-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[#c8b09e]">
              RSVP и контакты
            </p>
            <h2
              className="text-4xl md:text-5xl"
              style={{
                fontFamily:
                  '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Times New Roman", serif',
              }}
            >
              Будем счастливы видеть вас рядом
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#e9dccf]">
              Пожалуйста, подтвердите участие и напишите нам по любым вопросам в
              Telegram. Это поможет нам позаботиться о трансфере и комфорте
              каждого гостя.
            </p>
            <p className="mt-5 text-base text-[#cfb9a9]">
              Telegram: @KNIZHNIK_KM
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
            <a
              href={contactLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-[#f6f0e8] px-7 py-4 text-sm font-medium text-[#2f221c] transition hover:bg-white"
            >
              Подтвердить участие
            </a>
            <a
              href={mapsLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-[#a58a78] px-7 py-4 text-sm font-medium text-[#f6f0e8] transition hover:bg-[rgba(255,255,255,0.06)]"
            >
              Открыть маршрут
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
