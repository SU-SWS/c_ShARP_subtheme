import styled from "styled-components";
import {useWebComponentEvents} from "./hooks/useWebComponentEvents";
import {createIslandWebComponent} from 'preact-island'
import {useState, useEffect, useRef, useCallback, useMemo} from 'preact/hooks';
import {deserialize} from "./tools/deserialize";
import {buildMenuTree, MenuContentItem} from "./tools/build-menu-tree";
import {DRUPAL_DOMAIN} from './config/env'
import OutsideClickHandler from "./components/outside-click-handler";
import Caret from "./components/caret";
import Hamburger from "./components/hamburger";
import Close from "./components/close";

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
  justify-content: flex-start;
  list-style: none;
  margin: 0;
  background: #fff;
  padding: 0;
  font-size: 18px;
  box-shadow: 0 10px 20px rgba(0,0,0,.15),0 6px 6px rgba(0,0,0,.2);
  border-top: 1px solid #D5D5D4;

  @media (min-width: 992px) {
    display: flex;
    background: transparent;
    height: 100%;
    width: 100%;
    box-shadow: none;
    border-top: none;
`

const MobileMenuButton = styled.button`
  position: absolute;
  top: -70px;
  right: 10px;
  box-shadow: none;
  background: transparent;
  border: 0;
  color: #2e2d29;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1.6rem;

  &:hover, &:focus {
    background: transparent;
    color: #2e2d29;
    box-shadow: none;
  }

  @media (min-width: 992px) {
    display: none;
  }
`

export const MainMenu = ({}) => {
  useWebComponentEvents(islandName)
  const [menuItems, setMenuItems] = useState<MenuContentItem[]>(window.drupalSettings?.stanford_basic?.decoupledMenuItems || []);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (menuItems.length) return;

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

  const menuTree = useMemo(() => buildMenuTree(menuItems), [menuItems]);
  if (!menuTree.items || menuTree.items?.length === 0) return;

  // Remove the default menu.
  const existingMenu = document.getElementsByClassName('su-multi-menu');
  if (existingMenu.length > 0) existingMenu[0].remove();

  return (
    <OutsideClickHandler component="nav" style={{position: "relative", height: "100%"}} onOutsideFocus={() => setMenuOpen(false)}>
      <MobileMenuButton ref={buttonRef} onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}>
        {menuOpen ? <Close/> : <Hamburger/>}
        {menuOpen ? "Close" : "Menu"}
      </MobileMenuButton>

      <MenuWrapper open={menuOpen}>
        <TopList>
          {menuTree.items.sort((a, b) => a.weight < b.weight ? -1 : 1).map(item => <MenuItem key={item.id} {...item}/>)}
        </TopList>
      </MenuWrapper>
    </OutsideClickHandler>
  )
}

const Button = styled.button`
  color: #2e2d29;
  background: transparent;
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
  position: absolute;
  right: 4.2rem;
  top: 0.8rem;
  width: auto;
  border-radius: 0;

  &:hover, &:focus {
    box-shadow: none;
    text-decoration: underline;
    border-bottom: 2px solid #2e2d29;
    color: #2e2d29;
    background: transparent;
  }

  @media (min-width: 992px) {
    margin-left: 1rem;
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
    align-items: unset;
  }
`

const MenuLink = styled.a<{ isCurrent?: boolean, inTrail?: boolean, level?: number }>`
  color: #2e2d29;
  font-weight: ${({level, isCurrent}) => level != 0 ? (isCurrent ? "500" : "400") : "500"};
  font-family: Roboto Slab;
  text-decoration: none;
  padding: 2rem 6.2rem 2.6rem 3.6rem;
  padding-left: ${({level}) => level === 1 ? "5.6rem" : ""};
  padding-left: ${({level}) => level === 2 ? "7.6rem" : ""};
  padding-left: ${({level}) => level === 3 ? "9.6rem" : ""};
  padding-left: ${({level}) => level === 4 ? "11.6rem" : ""};
  padding-left: ${({level}) => level === 5 ? "13.6rem" : ""};
  transition: all 0.2s ease-in-out;
  border-left: ${({isCurrent}) => isCurrent ? "6px solid #007C7E" : "6px solid transparent"};
  width: 100%;
  background-color: ${({isCurrent}) => isCurrent ? "#f4f4f4" : "none"};

  &:hover, &:focus {
    text-decoration: underline;
    background-color: #f4f4f4;
  }

  @media (min-width: 992px) {
    padding: ${({level}) => level != 0 ? "2rem 6.2rem 2.6rem 3.6rem" : "1.6rem 0"};
    padding-left: ${({level}) => level === 2 ? "5.6rem" : ""};
    padding-left: ${({level}) => level === 3 ? "7.6rem" : ""};
    padding-left: ${({level}) => level === 4 ? "9.6rem" : ""};
    padding-left: ${({level}) => level === 5 ? "11.6rem" : ""};
    font-size: ${({level}) => level === 0 ? "19px" : "18px"};
    font-weight: ${({level}) => level === 1 ? "500" : ""};
    border-bottom: ${({level, inTrail, isCurrent}) => level === 0 ? (isCurrent ? "6px solid #007C7E" : (inTrail ? "6px solid #b6b1a9" : "6px solid transparent")) : ""};
    border-left: ${({level, isCurrent}) => level != 0 ? (isCurrent ? "6px solid #007C7E" : "6px solid transparent") : "none"};
    background-color: ${({level, isCurrent}) => level != 0 ? (isCurrent ? "#f4f4f4" : "unset") : "unset"};

    &:hover, &:focus {
      color: #2e2d29;
      border-left: ${({level, isCurrent}) => level != 0 ? (isCurrent ? "6px solid #007C7E" : "6px solid transparent") : "none"};
      background-color: ${({level}) => level != 0 ? "#f4f4f4" : "unset"};
    }

    + button {
      position: ${({level}) => level === 0 ? "relative" : ""};
      top: ${({level}) => level === 0 ? "0" : ""};
      right: ${({level}) => level === 0 ? "0" : ""};
    }
  }

  @media (min-width: 1396px) {
    padding: ${({level}) => level != 0 ? "2rem 6.2rem 2.6rem 3.6rem" : "0 0 4.7rem 0"};
    padding-left: ${({level}) => level === 2 ? "5.6rem" : ""};
    padding-left: ${({level}) => level === 3 ? "7.6rem" : ""};
    padding-left: ${({level}) => level === 4 ? "9.6rem" : ""};
    padding-left: ${({level}) => level === 5 ? "11.6rem" : ""};
    margin-top: ${({level}) => level != 0 ? "16px 0 16px 16px" : "1.5rem"};
  }
`

const NoLink = styled.span<{ level?: number }>`
  color: #2e2d29;
  font-family: Roboto Slab;
  font-weight: 600;
  text-decoration: none;
  padding: 2rem 0 2.6rem 4.2rem;

  @media (min-width: 992px) {
    font-weight: 500;
    padding: 1.6rem 0;
  }
`

const MenuList = styled.ul<{ open?: boolean, level?: number }>`
  display: ${props => props.open ? "block" : "none"};
  z-index: ${props => props.level + 1};
  list-style: none;
  padding: 0;
  margin: 0;
  border-top: 1px solid #D5D5D4;

  @media (min-width: 992px) {
    box-shadow: ${props => props.level === 0 ? "0 10px 20px rgba(0,0,0,.15),0 6px 6px rgba(0,0,0,.2)" : ""};
    position: ${props => props.level === 0 ? "absolute" : "relative"};
    top: 100%;
    background: #ffffff;
    right: ${props => props.level === 0 ? "3.2rem" : "0"};
    min-width: 40rem;
  }
`

const ListItem = styled.li<{ level?: number }>`
  position: relative;
  border-bottom: 1px solid #D5D5D4;
  margin: 0;
  padding: 0;

  &:last-child {
    border-bottom: none;
  }

  @media (min-width: 992px) {
    border-bottom: ${props => props.level === 0 ? "none" : "1px solid #d9d9d9"};
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
            <Button
              ref={buttonRef}
              onClick={() => setSubmenuOpen(!submenuOpen)}
              aria-expanded={submenuOpen}
              aria-label={(submenuOpen ? "Close" : "Open") + ` ${title} Submenu`}
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
