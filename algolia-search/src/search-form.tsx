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
  const {items: sharedRefinements, refine: refineSharedTypes} = useRefinementList({attribute: "shared_tags"});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("key")
    searchParams.delete("page-type")
    searchParams.delete("shared")

    if (query) searchParams.set("key", query);
    const pageTypes = pageTypeRefinements.filter(item => item.isRefined).map(item => item.value);
    const sharedTypes = sharedRefinements.filter(item => item.isRefined).map(item => item.value);

    if (pageTypes.length >= 1) searchParams.set("page-type", pageTypes.join(','))
    if (sharedTypes.length >= 1) searchParams.set("shared", sharedTypes.join(','))

    window.history.replaceState(null, '', `?${searchParams.toString()}`);
  }, [query, pageTypeRefinements, sharedRefinements])

  return (
    <form
      role="search"
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
        sharedRefinements.map(refinementItem => {
          if (refinementItem.isRefined) refineSharedTypes(refinementItem.value)
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

        </div>
      </div>

      <div style={{float: "left", width: "33%", "margin-top": "39px"}}>
        <fieldset>
          <legend>Basic Page Types</legend>

          <ul style={{listStyle: "none", paddingLeft: "0", marginInline: "0"}}>
            {pageTypeRefinements.map((item, i) =>
              <li
                key={i}
                className="w-fit flex items-center justify-center border border-black p-5 mb-5 last:mb-0"
                style={{
                  alignItems: "center",
                }}
              >
                <label style={{
                  marginTop: "1rem",
                  display: "flex",
                  alignItems: "center",
                }}>
                  <input
                    type="checkbox"
                    onChange={() => refinePageTypes(item.value)}
                    checked={item.isRefined}
                  />
                  {item.value} ({item.count})
                </label>
              </li>
            )}
          </ul>
        </fieldset>
        <fieldset>
          <legend>Shared Types</legend>

          <ul style={{listStyle: "none", paddingLeft: "0", marginInline: "0"}}>
            {sharedRefinements.map((item, i) =>
              <li
                key={`shared-i`}
                style={{alignItems: "center"}}
              >
                <label style={{
                  marginTop: "1rem",
                  display: "flex",
                  alignItems: "center",
                }}>
                  <input
                    type="checkbox"
                    onChange={() => refineSharedTypes(item.value)}
                    checked={item.isRefined}
                  />
                  {item.value} ({item.count})
                </label>
              </li>
            )}
          </ul>
        </fieldset>
        <button type="reset">
          Reset
        </button>
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
            <h1>Works</h1>
            {item.value}
            <button disabled={!canRefine} onClick={() => refine(item)}>Clear</button>
          </li>
        )
      })}
    </ul>
  );
}

export default SearchForm;
