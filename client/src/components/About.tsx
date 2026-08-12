import { MacroArt } from './art/MacroArt';
import { Reveal } from '../lib/hooks';
import { SITE } from '../lib/site';

export function About() {
  return (
    <section className="section about">
      <div className="container">
        <div className="about__grid">
          <Reveal className="about__art">
            <MacroArt variant="golden" tone="graphite" />
            <span className="about__art-caption caps">макро-съёмка · студийный свет</span>
          </Reveal>
          <Reveal className="about__copy" delay={120}>
            <p className="eyebrow">О студии</p>
            <h2 className="section-title">
              Красота — в <em className="italic">точности</em>
            </h2>
            <hr className="gold-rule" />
            <p>
              STUDIO SETA — персональное пространство мастера Екатерины для тех,
              кто ценит приватность, точность и индивидуальный подход. Мы работаем
              по записи и строим расписание вокруг вас: никаких очередей. Есть
              онлайн-календарь для удобства записи.
            </p>
            <p>
              Каждая форма выверяется как архитектурный объект — от строгого
              среза кутикулы до зеркального блика на покрытии. Стерильность,
              премиальные материалы и эстетика журнальной съёмки — здесь это не
              слова, а стандарт.
            </p>
            <ul className="about__list">
              <li>Один гость в студии — полная приватность</li>
              <li>Слоты синхронизированы с календарём мастера в реальном времени</li>
              <li>Стерилизация и одноразовые расходники — обязательно</li>
              <li>Покрытие и укрепление с гарантией носки</li>
            </ul>
            <div className="about__meta">
              <div>
                <span className="about__num">{SITE.workHours.split(' – ')[0]}</span>
                <span className="micro">начало рабочего дня</span>
              </div>
              <div>
                <span className="about__num">2 200 ₽</span>
                <span className="micro">стартовая цена маникюра</span>
              </div>
              <div>
                <span className="about__num">{SITE.age}</span>
                <span className="micro">возрастная маркировка</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
