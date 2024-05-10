import algoliasearch from 'algoliasearch/lite';
import {createIslandWebComponent} from 'preact-island'
import {HitsProps, InstantSearch, useHits} from 'react-instantsearch';
import SearchForm from "./search-form";
import EventHit from "./hits/events";
import NewsHit from "./hits/news";
import DefaultHit from "./hits/default-hit";
import styled from "styled-components";
import {StanfordHit} from "./hits/hit.types";

const islandName = 'algolia-search'
const appId = window.drupalSettings?.stanfordAlgolia.appId || process.env.ALGOLIA_APP_ID
const key = window.drupalSettings?.stanfordAlgolia.searchKey || process.env.ALGOLIA_KEY
const searchClient = algoliasearch(appId, key);

const Hit = ({hit}: HitsProps<StanfordHit>) => {
  if (hit.type === 'Event') return <EventHit hit={hit}/>
  if (hit.type === 'News') return <NewsHit hit={hit}/>

  return <DefaultHit hit={hit}/>
}

const ResultsContainer = styled.ul`
  list-style: none;
  padding-left: 0;

  @media (min-width: 768px) {
    float: right;
    width: 66%;
    padding-left: 2rem;
  }
`

const Container = styled.div`
  li {
    margin-bottom: 10px;

    &:last-child {
      border-bottom: none;
    }
  }

  [type=checkbox],[type=radio] {
    -webkit-clip-path: unset;
    padding: 0;
    width:  12px;
    height:12px;
    clip: unset;
    overflow: unset;
    position: relative;
    clipPath: unset;
    margin-right: 8px;
  }
  fieldset {
    padding: 0;
  }
`

const CustomHits = (props) => {
  const {hits} = useHits(props);
  if (hits.length === 0) return (
    <p>No results for your search. Please try another search.</p>
  )

  // Returns results
  return (
    <ResultsContainer>
      {hits.map(hit =>
        <li key={hit.objectID}>
          <Hit hit={hit}/>
        </li>
      )}
    </ResultsContainer>
  )
}


const Search = () => {
  const currentSearchParams = new URLSearchParams(window.location.search)

  const initialUiState = {};

  if (currentSearchParams.get('key')) {
    initialUiState.query = currentSearchParams.get('key');
  }
  if (currentSearchParams.get("page-type")) {
    initialUiState.refinementList = {basic_page_type: currentSearchParams.get("page-type").split(',')}
  }
  if (currentSearchParams.get("shared")) {
    initialUiState.refinementList = {shared_tags: currentSearchParams.get("shared").split(',')}
  }

  const searchIndex = window.drupalSettings?.stanfordAlgolia.index || process.env.ALGOLIA_INDEX;

  return (
    <div>
      <InstantSearch
        searchClient={searchClient}
        indexName={searchIndex}
        initialUiState={{
          [searchIndex]: initialUiState,
        }}
        future={{preserveSharedStateOnUnmount: true}}
      >
        <Container>
          <SearchForm/>
          <CustomHits/>
        </Container>
      </InstantSearch>
    </div>

  )
}


const island = createIslandWebComponent(islandName, Search)
island.render({
  selector: `${islandName}, #${islandName}`,
})
