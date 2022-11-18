import home from "/icons/home.svg";
import search from "/icons/search.svg";
import filter from "/icons/filter.svg";
import undo from "/icons/undo.svg";
import redo from "/icons/redo.svg";
import cursorArrow from "/icons/cursorArrow.svg";
import cursorHand from "/icons/cursorHand.svg";
import gridIcon from "/icons/grid.svg";
import autoRender from "/icons/autoRender.svg";
import chevronDown from "/icons/chevronDown.svg";
import zoomIn from "/icons/zoomIn.svg";
import zoomOut from "/icons/zoomOut.svg";
import save from "/icons/save.svg";
import contributors from "/icons/contributors.svg";
import history from "/icons/history.svg";
import launchIcon from "/icons/launch.svg";
import useStore, { State } from "../../store";
import { AUTO_RENDER_TYPE, STRUCTURE_RENDER_TYPE } from "../../types";

import s from "./topBar.module.scss";

const TopBar = () => {
  const { grid, renderType, viewTransform } = useStore();

  const handeButton = (changes: Partial<State>) => {
    useStore.setState(changes);
  };

  return (
    <header className={s["top-bar"]}>
      <div className={s["top-bar__section"]}>
        <div className={s["burger-menu"]}>
          <div className={s["burger-menu__line"]}></div>
          <div className={s["burger-menu__line"]}></div>
        </div>
      </div>
      <div className={`${s["top-bar__section"]} ${s["top-bar__search"]}`}>
        <div className={s["nav-path"]}>
          <a href="/">
            <img src={home} alt="Home" />
          </a>
          <div className={s["nav-path__name-box"]}>
            <span className={s["nav-path__separator"]}>/</span>
            <a className={s["nav-path__link"]} href="#">
              ...
            </a>
            <span className={s["nav-path__separator"]}>/</span>
            <a className={`${s["nav-path__link"]} ${s["nav-path__current"]}`} href="#">
              Breadcrumb
              <img src={chevronDown} alt="More" />
            </a>
          </div>
        </div>
        <div className={s.search}>
          <img src={search} alt="Search" />
          <input className={s.search__input} type="search" name="c-search" placeholder="Search" />
          <img src={filter} alt="Filters" />
        </div>
      </div>
      <div className={`${s["top-bar__section"]} ${s["top-bar__canvas-btns"]}`}>
        <div style={{ display: "flex", gap: 23 }}>
          <div className={s["undo-btns"]}>
            <button>
              <img src={undo} alt="Undo" />
            </button>
            <button>
              <img src={redo} alt="Redo" />
            </button>
          </div>

          <button>
            <img src={cursorArrow} alt="Cursor Arrow" />
          </button>
          <button>
            <img src={cursorHand} alt="Cursor Hand" />
          </button>
          <button onClick={() => handeButton({ grid: !grid })}>
            <img src={gridIcon} alt="Grid Switcher" />
          </button>
          <button
            onClick={() =>
              handeButton({
                renderType:
                  renderType === AUTO_RENDER_TYPE ? STRUCTURE_RENDER_TYPE : AUTO_RENDER_TYPE,
              })
            }
          >
            <img src={autoRender} alt="Auto Render" />
          </button>
        </div>

        <div className={s["zoom"]}>
          <button>
            <img src={zoomOut} alt="Zoom out" />
          </button>
          <button className={s["zoom__size"]}>
            <span>{(viewTransform[0] * 100).toFixed()}%</span>
            <img src={chevronDown} alt="More" />
          </button>
          <button>
            <img src={zoomIn} alt="Zoom in" />
          </button>
        </div>
      </div>
      <div className={s["top-bar__section"]} style={{ display: "flex", gap: 20 }}>
        <button>
          <img src={save} alt="Save" />
        </button>
        <button>
          <img src={contributors} alt="Contributors" />
        </button>
        <button>
          <img src={history} alt="History" />
        </button>
        <button className={s["launch-btn"]}>
          <img src={launchIcon} alt="Launch" />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
