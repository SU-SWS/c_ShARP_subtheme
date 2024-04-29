import {
  useCurrentRefinements,
  useInstantSearch,
  useRefinementList,
  useSearchBox
} from "react-instantsearch";
import {useEffect, useRef, useState} from "preact/compat";
import styled from "styled-components";

const SearchForm = (props) => {
  const ref = useRef(false)
  const windowSearchParams = new URLSearchParams(window.location.search)
  console.log("search Params: " + windowSearchParams)
  const {query, refine} = useSearchBox(props);
  const {items: pageTypeRefinements, refine: refineNewsType} = useRefinementList({attribute: "basic_page_type"});
  const [chosenNewsTypes, setChosenNewsTypes] = useState<string[]>(windowSearchParams.get('news-types')?.split(',') || []);
  const {status} = useInstantSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) return
    ref.current = true;
    chosenNewsTypes.map(newsType => refineNewsType(newsType));
  }, [ref, chosenNewsTypes])

  return (
      <fieldset>
        <legend>Filter by</legend>

        <ul style={{listStyle: "none"}}>
          {pageTypeRefinements.sort((a, b) => a.count < b.count ? 1 : (a.count === b.count ? (a.value < b.value ? -1 : 1) : -1)).map((item, i) =>
            <li key={i}>
              <label style={{
                'margin-top': '1rem'
              }}>
                <input
                  type="checkbox"
                  checked={chosenNewsTypes.findIndex(value => value === item.value) >= 0}
                  onChange={(e) => {
                    setChosenNewsTypes(prevTypes => {
                      const newTypes = [...prevTypes];
                      if (e.currentTarget.checked) {
                        newTypes.push(item.value);
                      } else {
                        newTypes.splice(prevTypes.findIndex(value => value === item.value), 1)
                      }
                      return newTypes;
                    });

                    ((e) => {
                      console.log("Value: " + e.target.value);
                    })(e);
                  }}
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
