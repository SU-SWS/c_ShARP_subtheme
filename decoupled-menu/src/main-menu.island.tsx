import styled from "styled-components";
import {useWebComponentEvents} from "./hooks/useWebComponentEvents";
import {createIslandWebComponent} from 'preact-island'
import {useState, useEffect, useRef, useCallback} from 'preact/hooks';
import {deserialize} from "./tools/deserialize";
import {buildMenuTree, MenuContentItem} from "./tools/build-menu-tree";
import {DRUPAL_DOMAIN} from './config/env'
import OutsideClickHandler from "./components/outside-click-handler";
import Caret from "./components/caret";
import Hamburger from "./components/hamburger";
import Close from "./components/close";
import MagnifyingGlass from "./components/magnifying-glass";

const islandName = 'main-menu-island'

const MenuWrapper = styled.div<{ open?: boolean }>`
  display: ${props => props.open ? "block" : "none"};
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);

  @media (min-width: 992px) {
    display: block;
    position: relative;
    height: 100%;
    width: 100%;
    margin: 0 auto;
  }
`

const TopList = styled.ul`
  flex-wrap: wrap;
  // justify-content: flex-end;
  justify-content: flex-start;
  list-style: none;
  margin: 0;
  background: #2e2d29;
  padding: 24px;
  font-size: 18px;

  @media (min-width: 992px) {
    display: flex;
    // justify-content: flex-start;
    background: transparent;
    padding: 0;
    font-size: 19px;
    height: 100%;
    width: 100%;
    // container-type: size;

  //   @container (min-height: 200px) {
  //     a {
  //       padding: 1.6rem 0;
  //     }
  //   }
  // }
`

const MobileMenuButton = styled.button`
  position: absolute;
  // top: -60px;
  top: -70px;
  right: 10px;
  box-shadow: none;
  background: transparent;
  border: 0;
  // border-bottom: 1px solid transparent;
  color: #2e2d29;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1.6rem;

  &:hover, &:focus {
    // border-bottom: 1px solid #2e2d29;
    background: transparent;
    color: #2e2d29;
    box-shadow: none;
  }

  @media (min-width: 992px) {
    display: none;
  }
`

const SearchContainer = styled.div`
  padding: 10px 30px 0;
  margin: 0;
  background: #2e2d29;

  form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  label {
    padding: 0 10px;
    margin: 0;
    color: #ffffff;
  }

  input {
    margin: 0;
    width: 100%;
    border-radius: 999px;
    height: 40px;
    padding: 0 20px;
    max-width: 100%;
  }

  button {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    color: #b1040e;
    border: 2px solid transparent;
    border-radius: 999px;
    aspect-ratio: 1;
    padding: 0;
    margin: 0;

    &:hover, &:focus {
      border: 1px solid #2e2d29;
    }
  }

  @media (min-width: 992px) {
    display: none;
  }
`

export const MainMenu = ({}) => {
  useWebComponentEvents(islandName)

  const [menuItems, setMenuItems] = useState<MenuContentItem[]>([]);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetch(DRUPAL_DOMAIN + '/jsonapi/menu_items/main')
      .then(res => res.json())
      .then(data => setMenuItems(deserialize(data)))
      .catch(err => console.error(err));
  }, [])

  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape" && menuOpen) {
      setMenuOpen(false);
      buttonRef.current.focus();
    }
  }, [menuOpen]);

  useEffect(() => {
    // Add keydown listener for escape button if the submenu is open.
    if (menuOpen) document.addEventListener("keydown", handleEscape);
    if (!menuOpen) document.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);

  const menuTree = buildMenuTree(menuItems);
  if (!menuTree.items || menuTree.items?.length === 0) return <div/>;

  // Remove the default menu.
  const existingMenu = document.getElementsByClassName('su-multi-menu');
  if (existingMenu.length > 0) {
    existingMenu[0].remove();
  }

  return (
    <OutsideClickHandler component="nav" style={{position: "relative", height: "100%"}} onOutsideFocus={() => setMenuOpen(false)}>
      <MobileMenuButton ref={buttonRef} onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}>
        {menuOpen ? <Close/> : <Hamburger/>}
        {menuOpen ? "Close" : "Menu"}
      </MobileMenuButton>

      <MenuWrapper open={menuOpen}>
        <SearchContainer>
          <form action="/search" method="get">
            <label htmlFor="mobile-search-input">Keyword Search</label>
            <div style={{position: "relative"}}>
              <input
                id="mobile-search-input"
                type="text"
                placeholder="Search this site"
                name="key"
              />
              <button type="submit">
                <MagnifyingGlass style={{width: "25px", height: "25px"}}/>
                <span className="visually-hidden">Submit Search</span>
              </button>
            </div>
          </form>

        </SearchContainer>
        <TopList>
          {menuTree.items.map(item => <MenuItem key={item.id} {...item}/>)}
        </TopList>
      </MenuWrapper>
    </OutsideClickHandler>
  )
}

const Button = styled.button`
  color: #ffffff;
  background: #b1040e;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 0;
  margin: 0 0 -4px;
  box-shadow: none;
  flex-shrink: 0;
  border-radius: 999px;
  transition: color 0.2s ease-in-out, background 0.2s ease-in-out, border 0.2s ease-in-out;
  width: 38px;
  height: 38px;

  &:hover, &:focus {
    box-shadow: none;
    border-bottom: 2px solid #b1040e;
    background: #f4f4f4;
    color: #000000;
  }

  @media (min-width: 992px) {
    // color: #b1040e;
    color: #2e2d29;
    background: transparent;
    border-radius: 0;
    // align-self: center;
    width: auto;
    margin-left: 1rem;
    // position: ${({level}) => level != 0 ? "absolute" : "unset"};
    // position: ${props => props.level != 0 ? "absolute" : "relative"};
    // right: ${props => props.level != 0 ? "2rem" : "unset"};
    // right: ${({level}) => level != 0 ? "2rem" : "unset"};

    &:hover, &:focus {
      border-bottom: 2px solid #2e2d29;
      color: #2e2d29;
      background: transparent;
    }
  }
`

const MenuItemContainer = styled.div<{ level?: number }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-right: ${props => props.level === 0 ? "32px" : "0"};

  width: 100%;

  @media (min-width: 992px) {
    width: ${props => props.level === 0 ? "fit-content" : "100%"};
    margin-bottom: ${props => props.level === 0 ? "6px" : ""};
    height: 100%;
    margin-bottom: 0;
    // align-items: end;
    align-items: unset;
  }
`

const MenuLink = styled.a<{ isCurrent?: boolean, inTrail?: boolean, level?: number }>`
  color: #ffffff;
  font-weight: 500;
  font-family: Roboto Slab;
  text-decoration: none;
  padding: 16px 0 16px 16px;
  transition: all 0.2s ease-in-out;
  border-left: ${({isCurrent}) => isCurrent ? "6px solid #b1040e" : "6px solid transparent"};
  width: 100%;

  &:hover, &:focus {
    text-decoration: underline;
    color: #ffffff;
    border-left: 6px solid #ffffff;
  }

  @media (min-width: 992px) {
    // color: #b1040e;
    color: #2e2d29;
    // padding: ${({level}) => level != 0 ? "16px 0 16px 16px" : "1.6rem 0"};
    // padding: ${({level}) => level != 0 ? "16px" : "1.6rem 0"};
    // padding: ${({level}) => level != 0 ? "3.6rem 3rem 3.6rem 3.6rem" : "1.6rem 0"};
    padding: ${({level}) => level != 0 ? "3.6rem 6.2rem 3.6rem 3.6rem" : "1.6rem 0"};
    padding-left: ${({level}) => level === 2 ? "5.6rem" : ""};
    padding-left: ${({level}) => level === 3 ? "7.6rem" : ""};
    // padding: ${({level}) => level != 0 ? "16px 0 16px 16px" : "0 0 2rem 0"};
    // margin-top: ${({level}) => level != 0 ? "16px 0 16px 16px" : "1.5rem"};
    border-bottom: ${({level, inTrail, isCurrent}) => level === 0 ? (isCurrent ? "6px solid #007C7E" : (inTrail ? "6px solid #b6b1a9" : "6px solid transparent")) : ""};
    // border-left: ${({level, isCurrent}) => level != 0 ? (isCurrent ? "6px solid #007C7E" : "6px solid transparent") : "none"};
    // border-left: ${({level, isCurrent}) => level != 0 ? (isCurrent ? "6px solid #007C7E" : "none") : "none"};
    border-left: ${({level, isCurrent}) => level != 0 ? (isCurrent ? "6px solid #007C7E" : "6px solid transparent") : "none"};
    // margin-bottom: ${({level, inTrail, isCurrent}) => level === 0 ? (isCurrent ? "-6px" : (inTrail ? "-6px" : "-6px")) : ""};
    // margin-bottom: 0;
    // padding-top: 0;
    // padding-bottom: 5.2rem;
    background-color: ${({level, isCurrent}) => level != 0 ? (isCurrent ? "#f4f4f4" : "none") : "none"};

    &:hover, &:focus {
      color: #2e2d29;
      // border-left: ${({level}) => level != 0 ? "6px solid #2e2d29" : "none"};
      // border-left: ${({level}) => level != 0 ? "6px solid #2e2d29" : "6px solid transparent"};
      // border-left: none;
      // border-left: ${({level}) => level != 0 ? "6px solid transparent" : "none"};
      border-left: ${({level, isCurrent}) => level != 0 ? (isCurrent ? "6px solid #007C7E" : "6px solid transparent") : "none"};
      // background-color: #f4f4f4;
      background-color: ${({level}) => level != 0 ? "#f4f4f4" : "unset"};
    }
  }

  // @media (min-width: 1200px) {
  //   // padding: ${({level}) => level != 0 ? "16px 0 16px 16px" : "0 0 5.2rem 0"};
  //   padding: ${({level}) => level != 0 ? "16px 0 16px 16px" : "0 0 4.7rem 0"};
  // }

  // @media (min-width: 1500px) {
  //   // padding: ${({level}) => level != 0 ? "16px 0 16px 16px" : "0 0 5.2rem 0"};
  //   padding: ${({level}) => level != 0 ? "16px 0 16px 16px" : "0 0 4.7rem 0"};
  // }

  @media (min-width: 1396px) {
    // padding: ${({level}) => level != 0 ? "16px 0 16px 16px" : "0 0 5.2rem 0"};
    // padding: ${({level}) => level != 0 ? "16px 0 16px 16px" : "0 0 4.7rem 0"};
    // padding: ${({level}) => level != 0 ? "16px" : "0 0 4.7rem 0"};
    // padding: ${({level}) => level != 0 ? "3.6rem 3rem 3.6rem 3.6rem" : "0 0 4.7rem 0"};
    padding: ${({level}) => level != 0 ? "3.6rem 6.2rem 3.6rem 3.6rem" : "0 0 4.7rem 0"};
    padding-left: ${({level}) => level === 2 ? "5.6rem" : ""};
    padding-left: ${({level}) => level === 3 ? "7.6rem" : ""};
    margin-top: ${({level}) => level != 0 ? "16px 0 16px 16px" : "1.5rem"};
  }
`

const NoLink = styled.span<{ level?: number }>`
  color: #ffffff;
  font-weight: 600;
  text-decoration: none;
  padding: 16px 0 16px 16px;

  @media (min-width: 992px) {
    // color: #b1040e;
    color: #2e2d29;
    font-weight: 500;
    font-family: Roboto Slab;
    padding: ${({level}) => level != 0 ? "16px 0 16px 16px" : "16px 0"};
  }
`

const MenuList = styled.ul<{ open?: boolean, level?: number }>`
  display: ${props => props.open ? "block" : "none"};
  z-index: ${props => props.level + 1};
  list-style: none;
  padding: 0;
  margin: 0;
  border-top: 1px solid #53565a;
  min-width: 300px;

  @media (min-width: 992px) {
    box-shadow: ${props => props.level === 0 ? "0 10px 20px rgba(0,0,0,.15),0 6px 6px rgba(0,0,0,.2)" : ""};
    position: ${props => props.level === 0 ? "absolute" : "relative"};
    top: 100%;
    background: #ffffff;
    border-top: 1px solid #d9d9d9;
    min-width: 370px;
    // right: 0;
  }
`

const ListItem = styled.li<{ level?: number }>`
  position: relative;
  border-bottom: 1px solid #53565a;
  padding: ${props => props.level > 0 ? "0 0 0 10px" : "0"};
  margin: 0;

  &:last-child {
    border-bottom: none;
  }

  @media (min-width: 992px) {
    border-bottom: ${props => props.level === 0 ? "none" : "1px solid #d9d9d9"};
    // padding: ${props => props.level > 0 ? "0 10px" : "0"};
    padding: 0;
  }
`

const MenuItemDivider = styled.div`
  width: 1px;
  height: 20px;
  margin: 0 6px;
  background: #766253;
  display: none;
  flex-shrink: 0;

  @media (min-width: 992px) {
    display: block;
  }
`

const MenuItem = ({title, url, items, expanded, level = 0}: { title: string, url: string, items?: MenuContentItem[], expanded: boolean, level?: number }) => {
  const buttonRef = useRef(null)
  const [submenuOpen, setSubmenuOpen] = useState(false)
  const basePath = window.location.protocol + "//" + window.location.host;
  let linkUrl = new URL(basePath);
  let isNoLink = true;
  let isCurrent, inTrail = false;

  if (url) {
    isNoLink = false;
    linkUrl = new URL(url.startsWith('/') ? `${basePath}${url}` : url);
    isCurrent = linkUrl.pathname === window.location.pathname;
    inTrail = url != '/' && window.location.pathname.startsWith(linkUrl.pathname) && !isCurrent;
  }

  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape" && submenuOpen) {
      setSubmenuOpen(false);
      buttonRef.current.focus();
    }
  }, [submenuOpen]);


  useEffect(() => {
    // Add keydown listener for escape button if the submenu is open.
    if (submenuOpen) document.addEventListener("keydown", handleEscape);
    if (!submenuOpen) document.removeEventListener("keydown", handleEscape);
  }, [submenuOpen]);

  return (
    <OutsideClickHandler
      onOutsideFocus={() => setSubmenuOpen(false)}
      component={ListItem}
      level={level}
    >
      <MenuItemContainer level={level}>
        {!isNoLink &&
          <MenuLink
            href={url}
            aria-current={isCurrent ? "page" : undefined}
            level={level}
            isCurrent={isCurrent}
            inTrail={inTrail}
          >
            {title}
          </MenuLink>
        }
        {isNoLink &&
          <NoLink>{title}</NoLink>
        }

        {(items && expanded) &&
          <>
            {/* {level === 0 &&
              <MenuItemDivider/>
            } */}
            <Button
              ref={buttonRef}
              onClick={() => setSubmenuOpen(!submenuOpen)}
              aria-expanded={submenuOpen}
              aria-label={(submenuOpen ? "Close" : "Open") + ` ${title} Submenu`}
              style={{
                position: level != 0 ? "absolute" : "unset",
                // right: level != 0 ? "2rem" : "unset",
                right: level != 0 ? "4.2rem" : "unset",
                top: level != 0 ? "2.2rem" : "unset",
              }}
            >
              <Caret style={{
                transform: submenuOpen ? "rotate(180deg)" : "",
                transition: "transform 0.2s ease-in-out",
                width: "16px",
                marginTop: "1.5rem",
              }}
              />
            </Button>
          </>
        }
      </MenuItemContainer>

      {(items && expanded) &&
        <MenuList open={submenuOpen} level={level}>

          {items.map(item =>
            <MenuItem key={item.id} {...item} level={level + 1}/>
          )}
        </MenuList>
      }
    </OutsideClickHandler>

  )
}


const island = createIslandWebComponent(islandName, MainMenu)
island.render({
  selector: `[data-island="${islandName}"]`,
})
