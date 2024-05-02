import {
  useCurrentRefinements,
  useInstantSearch,
  useRefinementList,
  useSearchBox
} from "react-instantsearch";
import {useEffect, useRef} from "preact/compat";

const SearchForm = (props) => {

  const {query, refine} = useSearchBox(props);
  const {items: pageTypeRefinements, refine: refinePageTypes} = useRefinementList({attribute: "basic_page_type"});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("key")
    searchParams.delete("page-type")

    if (query) searchParams.set("key", query);
    const pageTypes = pageTypeRefinements.filter(item => item.isRefined).map(item => item.value);

    if (pageTypes.length >= 1) searchParams.set("page-type", pageTypes.join(','))

    window.history.replaceState(null, '', `?${searchParams.toString()}`);
  }, [query, pageTypeRefinements])

  return (
    <form
      role="search"
      style={{marginBottom: "20px"}}
      onSubmit={(e) => {
        e.preventDefault();
        refine(inputRef.current.value)
      }}
      onReset={(e) => {
        inputRef.current.value = ""
        refine("");
        pageTypeRefinements.map(refinementItem => {
          if (refinementItem.isRefined) refinePageTypes(refinementItem.value)
        })
      }}
    >
      <div>
        <label htmlFor="keyword-search-algolia">
          Keywords<span className="visually-hidden">&nbsp;Search</span>
        </label>
        <input
          id="keyword-search-algolia"
          ref={inputRef}
          autoComplete="on"
          autoCorrect="on"
          autoCapitalize="off"
          spellCheck={true}
          maxLength={128}
          type="search"
          defaultValue={query}
        />

        <div style={{display: "flex", gap: "1rem", marginTop: "1rem"}}>
          <button type="submit">Submit</button>
          <button type="reset">
            Reset
          </button>
        </div>
      </div>

      <div style={{float: "left", width: "33%"}}>
        <fieldset style={{padding: "0"}}>
          <legend>Basic Page Types</legend>

          <ul style={{listStyle: "none", paddingLeft: "0", marginInline: "0"}}>
            {pageTypeRefinements.map((item, i) =>
              <li key={i}>
                <label style={{
                  'margin-top': '1rem'
                }}>
                  <input
                    type="checkbox"
                    onChange={() => refinePageTypes(item.value)}
                    checked={item.isRefined}
                    style={{
                      border: 'black',
                      width: '12px',
                      height: '12px',
                      float: 'left',
                      clip: 'unset',
                      overflow: 'unset',
                      position: 'relative',
                      clipPath: 'unset',
                      marginRight: "3"
                    }}
                  />
                  {item.value} ({item.count})
                </label>
              </li>
            )}
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

export default SearchForm;
