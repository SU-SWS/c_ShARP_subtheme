import {
  useCurrentRefinements,
  useInstantSearch,
  useRefinementList,
  useSearchBox
} from "react-instantsearch";
import {useEffect, useRef, useState} from "preact/compat";

const SearchForm = (props) => {
  const ref = useRef(false)
  const windowSearchParams = new URLSearchParams(window.location.search)
  const {query, refine} = useSearchBox(props);
  const {items: pageTypeRefinements, refine: refineNewsType} = useRefinementList({attribute: "basic_page_type"});
  const [chosenBasicPageTypes, setChosenNewsTypes] = useState<string[]>(windowSearchParams.get('basic-page-type')?.split(',') || []);
  const {status} = useInstantSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    refine(inputRef.current?.value);
    const addRefinements = chosenBasicPageTypes.filter(basicPageType => !pageTypeRefinements.find(item => item.value === basicPageType).isRefined);
    const removeRefinements = pageTypeRefinements.filter(refinement => refinement.isRefined && !chosenBasicPageTypes.includes(refinement.value)).map(refinement => refinement.value);
    [...addRefinements, ...removeRefinements].map(basicPageType => refineNewsType(basicPageType));
    const searchParams = new URLSearchParams(window.location.search);
    inputRef.current?.value.length > 0 ? searchParams.set('key', inputRef.current?.value) : searchParams.delete('key');
    chosenBasicPageTypes.length > 0 ? searchParams.set('basic-page-type', chosenBasicPageTypes.join(',')) : searchParams.delete('basic-page-type');
    window.history.replaceState(null, '', `?${searchParams.toString()}`);
  }

  const handleFormReset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    refine('');
    inputRef.current.value = '';
    inputRef.current?.focus();
    pageTypeRefinements.filter(refinement => refinement.isRefined).map(refinement => refineNewsType(refinement.value));
    setChosenNewsTypes([]);
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete('key');
    searchParams.delete('basic-page-type');
    window.history.replaceState(null, '', `?${searchParams.toString()}`);
  }
  const handleChange = (item, e) => {
    setChosenNewsTypes(prevTypes => {
      const pageTypes = [...prevTypes];
      if (e.currentTarget.checked) {
        pageTypes.push(item.value);
      } else {
        pageTypes.splice(prevTypes.findIndex(value => value === item.value), 1)
      }
      return pageTypes;
    });
    e.preventDefault();
    e.stopPropagation();
    refine(inputRef.current?.value);

    const addRefinements = chosenBasicPageTypes.filter(basicPageType => !pageTypeRefinements.find(it => it.value === basicPageType).isRefined)
    const removeRefinements = pageTypeRefinements.filter(refinement => refinement.isRefined && !chosenBasicPageTypes.includes(refinement.value)).map(refinement => refinement.value);

    [...addRefinements, ...removeRefinements].map(basicPageType => refineNewsType(basicPageType))

    const searchParams = new URLSearchParams(window.location.search)
    inputRef.current?.value.length > 0 ? searchParams.set('key', inputRef.current?.value): searchParams.delete('key');
    chosenBasicPageTypes.length > 0 ? searchParams.set('basic-page-type', chosenBasicPageTypes.join(',')) : searchParams.delete('basic-page-type')

    window.history.replaceState(null, '', `?${searchParams.toString()}`)
  }
  useEffect(() => {
    if (ref.current) return
    ref.current = true;
    chosenBasicPageTypes.map(basicPageType => refineNewsType(basicPageType));
  }, [ref, chosenBasicPageTypes])

  return (
    <form
      action=""
      role="search"
      noValidate
      onSubmit={handleFormSubmit}
      onReset={handleFormReset}
      style={{marginBottom: "20px"}}
    >
      <div className="lg:w-2/3 mx-auto mb-20 flex gap-5 items-center">
        <label htmlFor="keyword-search-algolia">
          Keywords<span className="visually-hidden">&nbsp;Search</span>
        </label>
        <input
          id="keyword-search-algolia"
          className="flex-grow border-0 border-b border-black-30 text-m2"
          ref={inputRef}
          autoComplete="on"
          autoCorrect="on"
          autoCapitalize="off"
          spellCheck={true}
          maxLength={128}
          type="search"
          defaultValue={query}
          autoFocus
        />

        <div style={{display: "flex", gap: "1rem", marginTop: "1rem"}}>
          <button type="submit">Submit</button>
          <button type="reset">
            Reset
          </button>
        </div>
      </div>

      <div style={{float: "left", width: "33%"}}>
        <fieldset>
          <legend>Basic Page Types</legend>

          <ul style={{listStyle: "none"}}>
            {pageTypeRefinements.sort((a, b) => a.count < b.count ? 1 : (a.count === b.count ? (a.value < b.value ? -1 : 1) : -1)).map((item, i) =>
              <li key={i}>
                <label style={{
                  'margin-top': '1rem'
                }}>
                  <input
                    type="checkbox"
                    checked={chosenBasicPageTypes.findIndex(value => value === item.value) >= 0}
                    onChange={(e) => handleChange(item, e)}
                    style={{
                      border: 'black',
                      width: '12px',
                      height: '12px',
                      float: 'left',
                      clip: 'unset',
                      overflow: 'unset',
                      position: 'relative',
                      'clip-path': 'unset',
                    }}
                  />
                  {item.value} ({item.count})
                </label>
              </li>
            )}
          </ul>
        </fieldset>
        <fieldset>
          <legend>Subject</legend>
          <ul style={{listStyle: "none"}}>

          </ul>
        </fieldset>
      </div>
    </form>
  );
}

const CustomCurrentRefinements = (props) => {
  const {items, canRefine, refine} = useCurrentRefinements(props);

  return (
    <ul style={{
      listStyle: "none",
      display: "flex",
      flexWrap: "wrap",
      gap: "10px"
    }}>
      {items.map(refinement => {
        return refinement.refinements.map((item, i) =>
          <li key={`refinement-${i}`}>
            {item.value}
            <button disabled={!canRefine} onClick={() => refine(item)}>Clear</button>
          </li>
        )
      })}
    </ul>
  );
}


const StatusMessage = ({status, query}) => {
  let message = status === 'loading' ? 'Loading' : null;
  if (status != 'loading' && query) {
    message = `Showing results for "${query}"`
  }
  return (
    <div className="visually-hidden" aria-live="polite" aria-atomic>{message}</div>
  )
}
export default SearchForm;
