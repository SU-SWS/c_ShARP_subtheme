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

const Container = styled.div`
  li {
    margin-bottom: 10px;

    &:last-child {
      border-bottom: none;
    }
  }
`

const CustomHits = (props) => {
  const {hits} = useHits(props);
  if (hits.length === 0) return (
    <p>No results for your search. Please try another search, gov'nor.</p>
  )

  return (
    <ul style={{listStyle: "none", padding: 0}}>
      {hits.map(hit =>
        <li key={hit.objectID}>
          <Hit hit={hit}/>
        </li>
      )}
    </ul>
  )
}


const Search = () => {
  const currentSearchParams = new URLSearchParams(window.location.search)
  const initialSearch = currentSearchParams.get('key');
  const searchIndex = window.drupalSettings?.stanfordAlgolia.index || process.env.ALGOLIA_INDEX;

  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={searchIndex}
      initialUiState={{
        [searchIndex]: {query: initialSearch},
      }}
    >
      <Container>
        <SearchForm/>
        <CustomHits/>
      </Container>
    </InstantSearch>
  )
}


const island = createIslandWebComponent(islandName, Search)
island.render({
  selector: `${islandName}, #${islandName}`,
})
