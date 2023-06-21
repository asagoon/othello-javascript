    //定数
    //マスの状態
    SQUARE_STATUS_IS_OWNED = "01";
    SQUARE_STATUS_IS_OTHER = "02";
    SQUARE_STATUS_NOT_SELECTED = "09";

    //トースターのオプション設定
    toastr.options = {
        tapToDismiss: false,
        timeOut: 0,
        extendedTimeOut: 0,
    };

    // ターンを示す変数
    let isOddTurn = true; 

    //イベント
    $(function(){
        //マス目にイベントを設定
        $('.square').click(clickSquareEvent);

        // 初期化ボタンを押したときのイベント
        $("#btn-initialize").click(initializeEvent);

        //盤面を初期化
        initializeEvent();
    });

    //マス目クリックイベント
    function clickSquareEvent(){
    //クリックされたマス目のオブジェクトを取得
    let square = $(this);

    //クリックされたマス目が選択できない場合はスキップ
    if(!canSelect(square)){
        return;
    }

    //ターン表示を削除
    toastr.remove();
    
    //マスの所有者を変更
    changeOwner(square);
    
    //ゲーム終了
    if(isGameEnd()){
        toastEndMessage("Game is Over");
        return;
    }

    if (isPass()) {
        // エラーメッセージを表示する
        toastr.remove();
        toastr.error(getTurnString() + "There are no square to choose");

        // 次のターンに変更する
        changeTurn();
        if (isPass()) {
            toastr.error(getTurnString() + "There are no square to choose");
            toastEndMessage("No more squares to choose");
        } else {
            setTimeout(function () {
                toastr.info(getTurnString() + "'s Turn");
            }, 1000);
        }

        return;
    }

    //次のターンを示すメッセージを表示
    toastr.info(getTurnString() + "'s Turn");
}

//盤面初期化イベント
function initializeEvent(){
    //ターン表示を削除
    toastr.remove();

    //マスの属性をリセット
    $(".square")
       .removeClass("selected")
       .text("")
       .attr("data-owner", "");

       // 奇数番手に戻す
    isOddTurn = true;
    //初期値設定
    changeOwner(getTargetSquare(3, 4));
    changeOwner(getTargetSquare(3, 3));
    changeOwner(getTargetSquare(4, 3));
    changeOwner(getTargetSquare(4, 4));

    //トースターを表示
    toastr.info(getTurnString() + "'s Turn");
}

//内部関数
//マス目の所有者を変更
function changeOwner(square){
//マス目にピースを置く
    putPiece(square,  getTurnString());

    // 隣接するピースを反転する
    changeOwnerOpposite(square);

    //ターンを変更
    changeTurn();
}

//マス目にピースを置く
function putPiece(targetSquare, owner){
    targetSquare.text("●").attr("data-owner", owner).addClass("selected");
}

//ターンを示す文字列を取得
function getTurnString(){
    if(isOddTurn) {
        return 'black';
    } 
        return 'white';
    }

    // ターンを変更、奇数のターンで黒、偶数のターンで白
    function changeTurn(){
        isOddTurn = !isOddTurn;

        // 選択可否を設定する
    for (let elem of $(".square")) {
        if (canSelect($(elem))) {
            $(elem).addClass("can-select");
            $(elem).removeClass("cant-select");
        } else {
            $(elem).removeClass("can-select");
            $(elem).addClass("cant-select");
        }
    }
    }

//所有者を変更
function changeOwnerOpposite(square){
    //クリックされたマス目の位置を取得
    let row = square.data("row");
    let col = square.data("col");
    
    //所有者を変更
    changeOwnerOppositeUpper(row, col);
    changeOwnerOppositeLower(row, col); //下
    changeOwnerOppositeLeft(row, col);
    changeOwnerOppositeRight(row, col);
    changeOwnerOppositeUpperLeft(row, col);
    changeOwnerOppositeUpperRight(row, col);
    changeOwnerOppositeLowerLeft(row, col);
    changeOwnerOppositeLowerRight(row, col);
}

//所有者を変更（上）
function changeOwnerOppositeUpper(row, col){
    //対向先を取得
    let endPos = getPosOppositeUpper(row, col);
    if(endPos == null){
        return;
    }

    //対向先まで所有者を変更する
    let targetCol = col;
    for (targetRow = row - 1; endPos.row < targetRow; targetRow--) {
        let square = getTargetSquare(targetRow, targetCol);
        putPiece(square, getTurnString());
    }
}

//対向の所有マスの位置を取得(上)
function getPosOppositeUpper(row, col){
    //基準マスが最短の場合は対向先が存在しない
    if(row == 0){
        return null;
    }

    //隣接マスが相手所有ではない場合は対向先が存在しない
    let targetRow = row - 1;
    let targetCol = col;
    if(getSquareStatus(targetRow, targetCol) != SQUARE_STATUS_IS_OTHER){
        return null;
    }

    //対向先の有無を判定
    for (targetRow--; 0 <= targetRow; targetRow--) {
        //マスの状態を取得
        let squareType = getSquareStatus(targetRow, targetCol);
        //選択されていないマスに到達した場合は終了する
        if(squareType ==SQUARE_STATUS_NOT_SELECTED) {
            return null;
        }

        //自分の所有マスに到達した場合、位置を返却
        if(squareType == SQUARE_STATUS_IS_OWNED) {
            return {
                row: targetRow,
                col: targetCol,
            };
        }
    }
    return null;
}

//所有者を変更（下）
function changeOwnerOppositeLower(row, col){
    //対向先を取得
    let endPos = getPosOppositeLower(row, col);
    if(endPos == null){
        return;
    }

    //対向先まで所有者を変更する
    let targetCol = col;
    for (targetRow = row + 1; targetRow < endPos.row; targetRow++) {
        let targetSquare = getTargetSquare(targetRow, targetCol);
        putPiece(targetSquare, getTurnString());
    }
}

//対向の所有マスの位置を取得(下)
function getPosOppositeLower(row, col){
    if(row == 7){
        return null;
    }

    //隣接マスが相手所有ではない場合は対向先が存在しない
    let targetRow = row + 1;
    let targetCol = col;
    if(getSquareStatus(targetRow, targetCol) != SQUARE_STATUS_IS_OTHER){
        return null;
    }

    //対向先の有無を判定
    for (targetRow++; targetRow <= 7; targetRow++) {
        //マスの状態を取得
        let status = getSquareStatus(targetRow, targetCol);
        //選択されていないマスに到達した場合は終了する
        if(status ==SQUARE_STATUS_NOT_SELECTED) {
            return null;
        }

        //自分の所有マスに到達した場合、位置を返却
        if(status == SQUARE_STATUS_IS_OWNED) {
            return {
                row: targetRow,
                col: targetCol,
            };
        }
    }
    return null;
}

//所有者を変更（左）
function changeOwnerOppositeLeft(row, col){
    //対向先を取得
    let endPos = getPosOppositeLeft(row, col);
    if(endPos == null){
        return;
    }

    // 対向先まで所有者を変更する
    let targetRow = row;
    for (targetCol = col - 1; endPos.col < targetCol; targetCol--) {
        let square = getTargetSquare(targetRow, targetCol);
        putPiece(square, getTurnString());
    }
}

//対向の所有マスの位置を取得(左)
function getPosOppositeLeft(row, col){
    //基準マスが最短の場合は対向先が存在しない
    if(col == 0){
        return null;
    }

    //隣接マスが相手所有ではない場合は対向先が存在しない
    let targetRow = row;
    let targetCol = col - 1;
    if(getSquareStatus(targetRow, targetCol) != SQUARE_STATUS_IS_OTHER){
        return null;
    }

    //対向先の有無を判定
    for (targetCol--; 0 <= targetCol; targetCol--) {
        //マスの状態を取得
        let squareType = getSquareStatus(targetRow, targetCol);
        //選択されていないマスに到達した場合は終了する
        if(squareType ==SQUARE_STATUS_NOT_SELECTED) {
            return null;
        }

        // 自分の所有マスに到達した場合、位置を返却する
        if (squareType == SQUARE_STATUS_IS_OWNED) {
            return {
                row: targetRow,
                col: targetCol,
            };
        }
    }
    return null;
}

//所有者を変更（右）
function changeOwnerOppositeRight(row, col){
    //対向先を取得
    let endPos = getPosOppositeRight(row, col);
    if(endPos == null){
        return;
    }

    // 対向先まで所有者を変更する
    let targetRow = row;
    for (targetCol = col + 1; targetCol < endPos.col; targetCol++) {
        let square = getTargetSquare(targetRow, targetCol);
        putPiece(square, getTurnString());
    }
}

//対向の所有マスの位置を取得(右)
function getPosOppositeRight(row, col) {
    // 基準マスが最端の場合は対向先が存在しない
    if (col == 7) {
        return null;
    }

    // 隣接マスが相手所有ではない場合は対向先が存在しない
    let targetRow = row;
    let targetCol = col + 1;
    if (getSquareStatus(targetRow, targetCol) != SQUARE_STATUS_IS_OTHER) {
        return null;
    }

    // 対向先の有無を判定する
    for (targetCol++; targetCol <= 7; targetCol++) {
        // マスの状態を取得する
        let squareType = getSquareStatus(targetRow, targetCol);

        // 選択されていないマスに到達した場合は終了する
        if (squareType == SQUARE_STATUS_NOT_SELECTED) {
            return null;
        }

        // 自分の所有マスに到達した場合、位置を返却する
        if (squareType == SQUARE_STATUS_IS_OWNED) {
            return {
                row: targetRow,
                col: targetCol,
            };
        }
    }
    return null;
}

//所有者を変更（左上）
function changeOwnerOppositeUpperLeft(row, col) {
    // 対向先を取得する
    let endPos = getPosOppositeUpperLeft(row, col);
    if (endPos == null) {
        return;
    }

    // 対向先まで所有者を変更する
    for (
        targetRow = row - 1, targetCol = col - 1;
        endPos.row < targetRow, endPos.col < targetCol;
        targetRow--, targetCol--
    ) {
        let square = getTargetSquare(targetRow, targetCol);
        putPiece(square, getTurnString());
    }
}

//対向の所有マスの位置を取得(左上)
function getPosOppositeUpperLeft(row, col) {
    // 基準マスが最端の場合は対向先が存在しない
    if (row == 0 || col == 0) {
        return null;
    }

    // 隣接マスが相手所有ではない場合は対向先が存在しない
    let targetRow = row - 1;
    let targetCol = col - 1;
    if (getSquareStatus(targetRow, targetCol) != SQUARE_STATUS_IS_OTHER) {
        return null;
    }

    // 対向先の有無を判定する
    for (
        targetRow--, targetCol--;
        0 < targetRow, 0 < targetCol;
        targetRow--, targetCol--
    ) {
        // マスの状態を取得する
        let squareType = getSquareStatus(targetRow, targetCol);

        // 選択されていないマスに到達した場合は終了する
        if (squareType == SQUARE_STATUS_NOT_SELECTED) {
            return null;
        }

        // 自分の所有マスに到達した場合、位置を返却する
        if (squareType == SQUARE_STATUS_IS_OWNED) {
            return {
                row: targetRow,
                col: targetCol,
            };
        }
    }
    return null;
}

//所有者を変更（右上）
function changeOwnerOppositeUpperRight(row, col){
    //対向先を取得
    let endPos = getPosOppositeUpperRight(row, col);
    if(endPos == null){
        return;
    }

    //対向先まで所有者を変更する
    for (targetRow = row - 1, targetCol = col + 1; 
        endPos.row < targetRow, targetCol < endPos.col; targetRow--, targetCol++) {
        let square = getTargetSquare(targetRow, targetCol);
        putPiece(square, getTurnString());
    }
}

//対向の所有マスの位置を取得(右上)
function getPosOppositeUpperRight(row, col){
    //基準マスが最短の場合は対向先が存在しない
    if(row == 0 || col == 7){
        return null;
    }

    //隣接マスが相手所有ではない場合は対向先が存在しない
    let targetRow = row - 1;
    let targetCol = col + 1;
    if(getSquareStatus(targetRow, targetCol) != SQUARE_STATUS_IS_OTHER){
        return null;
    }

    //対向先の有無を判定
    for (targetRow--,targetCol++; 0 <= targetRow, targetCol <= 7; targetRow--, targetCol++) {
        //マスの状態を取得
        let squareType = getSquareStatus(targetRow, targetCol);
        //選択されていないマスに到達した場合は終了する
        if(squareType ==SQUARE_STATUS_NOT_SELECTED) {
            return null;
        }

        //自分の所有マスに到達した場合、位置を返却
        if(squareType == SQUARE_STATUS_IS_OWNED) {
            return {
                row: targetRow,
                col: targetCol,
            };
        }
    }
    return null;
}

//所有者を変更(左下)
function changeOwnerOppositeLowerLeft(row, col){
    //対向先を取得
    let endPos = getPosOppositeLowerLeft(row, col);
    if(endPos == null){
        return;
    }

    //対向先まで所有者を変更する
    for (targetRow = row + 1, targetCol = col - 1; 
        targetRow < endPos.row, endPos.col < targetCol; targetRow++, targetCol--) {
        let square = getTargetSquare(targetRow, targetCol);
        putPiece(square, getTurnString());
    }
}

//対向の所有マスの位置を取得(左下)
function getPosOppositeLowerLeft(row, col){
    //基準マスが最短の場合は対向先が存在しない
    if(row == 7 || col == 0){
        return null;
    }

    //隣接マスが相手所有ではない場合は対向先が存在しない
    let targetRow = row + 1;
    let targetCol = col - 1;
    if(getSquareStatus(targetRow, targetCol) != SQUARE_STATUS_IS_OTHER){
        return null;
    }

    //対向先の有無を判定
    for (targetRow++,targetCol--; targetRow <= 7, 0 <= targetCol; targetRow++, targetCol--) {
        //マスの状態を取得
        let squareType = getSquareStatus(targetRow, targetCol);
        //選択されていないマスに到達した場合は終了する
        if(squareType ==SQUARE_STATUS_NOT_SELECTED) {
            return null;
        }

        //自分の所有マスに到達した場合、位置を返却
        if(squareType == SQUARE_STATUS_IS_OWNED) {
            return {
                row: targetRow,
                col: targetCol,
            };
        }
    }
    return null;
}

//所有者を変更(右下)
function changeOwnerOppositeLowerRight(row, col){
    //対向先を取得
    let endPos = getPosOppositeLowerRight(row, col);
    if(endPos == null){
        return;
    }

    //対向先まで所有者を変更する
    for (targetRow = row + 1, targetCol = col + 1; 
        targetRow < endPos.row, targetCol < endPos.col; targetRow++, targetCol++) {
        let square = getTargetSquare(targetRow, targetCol);
        putPiece(square, getTurnString());
    }
}

//対向の所有マスの位置を取得(右下)
function getPosOppositeLowerRight(row, col){
    //基準マスが最短の場合は対向先が存在しない
    if(row == 7 || col == 7){
        return null;
    }

    //隣接マスが相手所有ではない場合は対向先が存在しない
    let targetRow = row + 1;
    let targetCol = col + 1;
    if(getSquareStatus(targetRow, targetCol) != SQUARE_STATUS_IS_OTHER){
        return null;
    }

    //対向先の有無を判定
    for (targetRow++,targetCol++; targetRow <= 7, targetCol <= 7; targetRow++, targetCol++) {
        //マスの状態を取得
        let squareType = getSquareStatus(targetRow, targetCol);
        //選択されていないマスに到達した場合は終了する
        if(squareType ==SQUARE_STATUS_NOT_SELECTED) {
            return null;
        }

        //自分の所有マスに到達した場合、位置を返却
        if(squareType == SQUARE_STATUS_IS_OWNED) {
            return {
                row: targetRow,
                col: targetCol,
            };
        }
    }
    return null;
}

//調査対象のマス目の状態を取得
function getSquareStatus(row, col) {
    //マスを取得
    let targetSquare = getTargetSquare(row, col);

    //selectedクラスを持っていなければ未選択
    if(!targetSquare.hasClass("selected")) {
        return SQUARE_STATUS_NOT_SELECTED;
    }

    // 自分が所有している
    if(getTurnString() == targetSquare.attr("data-owner")){
        return SQUARE_STATUS_IS_OWNED; 
    }
    //相手が所有している
    return SQUARE_STATUS_IS_OTHER;
}

//指定位置のマス目オブジェクトを取得
function getTargetSquare(row, col) {
    return $("[data-row =" + row + "][data-col=" + col + "]");
}

//指定されたマス目が選択できるか判定
function canSelect(square){
    if(square.hasClass('selected')){
        return false;
    }
    let row = square.data("row");
    let col = square.data("col");
    if(getPosOppositeUpper(row, col) != null){
        return true;
    }
    if(getPosOppositeLower(row, col) != null){
        return true;
    }
    if(getPosOppositeLeft(row, col) != null){
        return true;
    }
    if(getPosOppositeRight(row, col) != null){
        return true;
    }
    if(getPosOppositeUpperLeft(row, col) != null){
        return true;
    }
    if(getPosOppositeUpperRight(row, col) != null){
        return true;
    }
    if(getPosOppositeLowerLeft(row, col) != null){
        return true;
    }
    if(getPosOppositeLowerRight(row, col) != null){
        return true;
    }
    return false;
}

/**
 * ゲーム終了を判定する
 */
function isGameEnd() {
    if ($(".square.selected").length == 64) {
        return true;
    }
    return false;
}

//ゲーム終了メッセージを表示
function toastEndMessage(message){
    let countBlack = $("[data-owner=black]").length;
    let countWhite = $("[data-owner=white]").length;

    let judgeString = 
            "black:" + countBlack + "<br/>" + "white" + countWhite + "<br/>";

    // メッセージを表示する
    if (countBlack == countWhite) {
        toastr.success(message + "<br/>" + judgeString + "Draw");
    } else if (countBlack < countWhite) {
        toastr.success(message + "<br/>" + judgeString + "white Wins");
    } else {
        toastr.success(message + "<br/>" + judgeString + "black Wins");
    }
}

//番手がパスかどうかを判定
function isPass(){
    if($(".square.can-select").length == 0){
        return true;
    }
    return false;
}