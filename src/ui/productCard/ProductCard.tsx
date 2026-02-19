import { memo, useEffect, useState, useRef, forwardRef } from "react";
import ReactDOM from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import type { FC } from "react";
import styles from "./ProductCard.module.css";
import type { IProduct } from "./type";
import { useAppDispatch } from "../..//services/hooks";
import { addAndDeleteToFavoriteItems } from "../../services/slices/userUIData";
/*`../assets/${props.image}`*/

export const ProductCard = forwardRef<HTMLDivElement, IProduct>(
  (props, refCont) => {
    const dispatch = useAppDispatch();
    const [like, setLike] = useState<boolean>(props.isLiked);
    const heartlike = useRef<HTMLSpanElement>(null);
    const navigate = useNavigate();

    function handleClick(evt: React.MouseEvent<HTMLDivElement>) {
      if (heartlike) {
        if (evt.target !== heartlike.current) {
          navigate(`/card/id=${props.id}`);
        }
      }
    }

    function handleLike() {
      dispatch(addAndDeleteToFavoriteItems(props.id));
      setLike(!like);
    }

    return (
      <div
        ref={refCont}
        onClick={handleClick}
        className={`${styles.container} ${props.className}`}
        id={props.id}
        data-cy={`productCard-${props.id}`}
      >
        <img className={styles.image} src={props.image}></img>
        <p className={styles.price}>{`${props.price}₽`}</p>
        <p className={styles.title}>{props.title}</p>
        <p className={styles.description}>{props.shortDescription}</p>
        <span
          ref={heartlike}
          onClick={handleLike}
          className={`${styles.like} ${like ? styles["like-done"] : ""}`}
        ></span>
      </div>
    );
  },
);
