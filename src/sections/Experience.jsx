import { useLang, html, plain } from '../i18n.jsx';
import SplitText from '../bits/SplitText.jsx';

const XP = [['x.sa.when', 'x.sa.h3', 'x.sa.org', 'x.sa.desc'], ['x.ms.when', 'x.ms.h3', null, 'x.ms.desc', 'National Centre for the Distinguished, Homs'], ['x.fe.when', 'x.fe.h3', null, 'x.fe.desc', 'Xcore Corporation, Swaida']];
const ED = [['e.tum.when', null, 'e.tum.p', 'B.Sc. Information Engineering'], ['e.itt.when', 'e.itt.h3', 'e.itt.p']];

export default function Experience() {
  const { t } = useLang();
  const title = (k, id) => (<>
    <SplitText tag="h2" text={plain(t(k))} className="d2" splitType="lines" mask effect="rise" textAlign="left" duration={1} delay={80} />
    <span id={id} hidden>{plain(t(k))}</span>
  </>);
  return (
    <section className="section" id="experience" aria-labelledby="x-h">
      <div className="wrap cv">
        <div>
          {title('x.h2', 'x-h')}
          <div className="entries">
            {XP.map(([w, h, o, d, org]) => (
              <div className="entry reveal" key={h}>
                <span className="when">{t(w)}</span>
                <h3 {...html(t(h))} />
                <p className="org" {...html(o ? t(o) : org)} />
                <p className="desc" {...html(t(d))} />
              </div>
            ))}
          </div>
        </div>
        <div>
          {title('e.h2', 'e-h')}
          <div className="entries">
            {ED.map(([w, h, p, fixed]) => (
              <div className="entry reveal" key={w}>
                <span className="when">{t(w)}</span>
                <h3 {...html(h ? t(h) : fixed)} />
                <p className="desc" {...html(t(p))} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
