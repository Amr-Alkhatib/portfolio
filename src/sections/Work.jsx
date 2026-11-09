import { useLang, html, plain } from '../i18n.jsx';
import SplitText from '../bits/SplitText.jsx';
import SpotlightCard from '../bits/SpotlightCard.jsx';
import { MockVisually, MockWanderly, MockTruckOps, MockPitchRoom } from '../mocks/Mocks.jsx';

const Out = () => <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg>;
const Code = () => <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" /></svg>;

const PROJECTS = [
  { name: 'Visually', url: 'visually-ppfe.vercel.app', Mock: MockVisually, award: 'rec.tom', prize: true, date: 'date.nov25', summary: 'v.summary',
    blocks: [['blk.problem', 'v.problem'], ['blk.built', 'v.built'], ['blk.hard', 'v.hard']], small: 'v.small',
    stack: ['React', 'Neon Postgres', 'Vercel', 'Gemini API'], open: ['https://visually-ppfe.vercel.app/', 'v.cta1'], code: 'https://github.com/Prashantstrugglestocode/Visually' },
  { name: 'Wanderly', url: 'wanderly.pythonanywhere.com', Mock: MockWanderly, award: 'w.chip', date: 'date.jul26', summary: 'w.summary',
    blocks: [['blk.problem', 'w.problem'], ['blk.built', 'w.built'], ['blk.hard', 'w.hard'], ['blk.mine', 'w.mine']],
    stack: ['Python', 'Django', 'PostgreSQL', 'Supabase Auth', 'Gemini', 'Docker'], open: ['https://wanderly.pythonanywhere.com/', 't.cta'], code: 'https://github.com/Amr-Alkhatib/wanderly' },
  { name: 'TruckOps', url: 'truckops03.lovable.app', Mock: MockTruckOps, award: null, awardText: 'TUM Business Game', date: 'date.oct26', summary: 't.summary',
    blocks: [['blk.problem', 't.problem'], ['blk.does', 't.built'], ['blk.hard', 't.hard'], ['blk.mine', 't.mine']], small: 'small.partner',
    stack: ['React', 'TypeScript', 'TanStack Start', 'Supabase', 'Drizzle', 'OSRM', 'Vitest', 'Lovable'], open: ['https://truckops03.lovable.app/', 't.cta'], code: 'https://github.com/Amr-Alkhatib/truckops03' },
  { name: 'PitchRoom', url: 'pitchroom03.lovable.app', Mock: MockPitchRoom, award: null, awardText: 'TUM Business Game', date: 'date.oct26', summary: 'p.summary',
    blocks: [['blk.problem', 'p.problem'], ['blk.built', 'p.built'], ['blk.hard', 'p.hard']], small: 'small.partner',
    stack: ['React', 'TypeScript', 'AssemblyAI', 'Gemini', 'Lovable'], open: ['https://pitchroom03.lovable.app/', 'p.cta'] },
];

export default function Work() {
  const { t } = useLang();
  return (
    <section className="section" id="work" aria-labelledby="work-h">
      <div className="wrap">
        <div className="section-head">
          <SplitText tag="h2" text={plain(t('work.h2'))} className="d2" splitType="lines" mask effect="rise" textAlign="left" duration={1} delay={80} />
          <span id="work-h" hidden>{plain(t('work.h2'))}</span>
          <p className="reveal" {...html(t('work.p'))} />
        </div>
        <div className="projects">
          {PROJECTS.map((p) => (
            <article className="project" key={p.name} aria-labelledby={'p-' + p.name}>
              <div className="browser-wrap reveal">
                <SpotlightCard className="browser" spotlightColor="rgba(142,156,255,0.9)" intensity={0.22} spotlightSize={420} borderGlow={0.9}>
                  <div className="browser-bar"><span className="dots" aria-hidden="true"><i /><i /><i /></span><span className="url">{p.url}</span></div>
                  <div className="screen"><p.Mock /></div>
                </SpotlightCard>
              </div>
              <div className="case reveal">
                <div className="meta">
                  <span className={'award' + (p.prize ? ' prize' : '')}><i aria-hidden="true" />{p.award ? t(p.award) : p.awardText}</span>
                  <span className="date">{t(p.date)}</span>
                </div>
                <h3 className="d3" id={'p-' + p.name}>{p.name}</h3>
                <p className="summary" {...html(t(p.summary))} />
                {p.blocks.map(([k, v]) => (
                  <div className="block" key={v}><b {...html(t(k))} /><p {...html(t(v))} /></div>
                ))}
                {p.small && <p className="small" {...html(t(p.small))} />}
                <ul className="stack" aria-label="Stack">{p.stack.map((s) => <li key={s}>{s}</li>)}</ul>
                <div className="ctas">
                  <a className="btn btn-primary" href={p.open[0]} target="_blank" rel="noopener"><span>{t(p.open[1])}</span><Out /></a>
                  {p.code && <a className="btn btn-ghost" href={p.code} target="_blank" rel="noopener"><Code /><span>{t('v.cta2')}</span></a>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
