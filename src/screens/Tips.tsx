import { useMemo, useState } from 'react';
import { ArticlePhotoCard, ArticleSideCard, ArticleTextCard, SearchField, VideoRowCard, VideoWideCard } from '../components/blocks';
import { Screen } from '../components/Shell';
import { ChipGroup, MoreAction, PageHeader, SectionHeader } from '../components/ui';
import { articles, featuredVideo, tipFilters, videos, type TipFilter } from '../data/mock';
import { useOutOfScope } from '../hooks/useOutOfScope';

const filterOptions = tipFilters.map((f) => ({ value: f, label: f }));

export default function Tips() {
  const outOfScope = useOutOfScope();
  const [filter, setFilter] = useState<TipFilter>('Усі');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const match = (text: string) => !q || text.toLowerCase().includes(q);

  const shownArticles = useMemo(
    () => articles.filter((a) => (filter === 'Усі' || filter === a.tag) && match(`${a.title} ${a.desc ?? ''}`)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filter, q],
  );
  const allVideos = [featuredVideo, ...videos];
  const shownVideos = allVideos.filter((v) => (filter === 'Усі' || filter === 'Відео' || filter === v.tag) && match(v.title));
  const showFeatured = shownVideos.some((v) => v.id === featuredVideo.id);
  const restVideos = shownVideos.filter((v) => v.id !== featuredVideo.id);
  const showArticles = filter !== 'Відео' && shownArticles.length > 0;
  const nothing = !showFeatured && !showArticles && restVideos.length === 0;

  return (
    <Screen>
      <PageHeader title="Поради та відео" sub="Матеріали для догляду за улюбленцями" />
      <SearchField label="Пошук" placeholder="Пошук порад і відео" value={query} onChange={setQuery} />
      <ChipGroup label="Категорії" options={filterOptions} value={filter} onChange={setFilter} />

      <div role="status" aria-live="polite" className={nothing ? 'empty card' : 'visually-hidden'}>
        {nothing ? 'Нічого не знайдено. Змініть запит або категорію.' : ''}
      </div>

      {showFeatured && (
        <VideoWideCard
          title={featuredVideo.title}
          meta={`${featuredVideo.tag} · 12:30`}
          duration={featuredVideo.duration}
          onOpen={() => outOfScope('Відео')}
        />
      )}

      {showArticles && (
        <section className="section" aria-labelledby="h-new">
          <SectionHeader id="h-new" title="Нові статті" action={<MoreAction label="Усі нові статті" onClick={() => outOfScope('Список статей')} />} />
          {shownArticles.map((a) =>
            a.variant === 'photo' ? (
              <ArticlePhotoCard key={a.id} title={a.title} desc={a.desc!} tag={a.tag} read={a.read} tone={a.tone} onOpen={() => outOfScope('Стаття')} />
            ) : a.variant === 'text' ? (
              <ArticleTextCard key={a.id} title={a.title} desc={a.desc!} tag={a.tag} read={a.read} onOpen={() => outOfScope('Стаття')} />
            ) : (
              <ArticleSideCard key={a.id} title={a.title} tag={a.tag} read={a.read} tone={a.tone} tagTone="info" onOpen={() => outOfScope('Стаття')} />
            ),
          )}
        </section>
      )}

      {restVideos.length > 0 && (
        <section className="section" aria-labelledby="h-videos">
          <SectionHeader id="h-videos" title="Відео" action={<MoreAction label="Усі відео" onClick={() => outOfScope('Список відео')} />} />
          {restVideos.map((v) => (
            <VideoRowCard key={v.id} title={v.title} meta={`${v.tag} · ${v.duration}`} onOpen={() => outOfScope('Відео')} />
          ))}
        </section>
      )}
    </Screen>
  );
}
