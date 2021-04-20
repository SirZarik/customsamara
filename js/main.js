var packageThings = [];
var acceptableThings = ['med', 'clothes', 'jewerly', 'bottle'];
var maxItems = 4;
var curItems = 0;
var description = {'med': ['Медикаменты','Можно провозить'],
                    'glock': ['Огнестрельное оружие','Уголовная ответсвенность'],
                    'money': ['Деньги в особо крупном размере','Штраф'],
                    'sculpt': ['Скульптура','Уголовная ответсвенность'],
                    'seeds': ['Части и семена растений','Штраф'],
                    'clothes': ['Одежда','Можно провозить'],
                    'jewerly': ['Декларированные драгоценности','Можно провозить'],
                    'bottle': ['Алкоголь','Можно провозить']};

$("#menu").fadeOut();

$("#go").attr('onclick', 'showResult()');


function showResult(){
    menu = $("#menu");
    menu.fadeIn(1000);

    resElem = $("#results");

    packageThings = packageThings.filter(function(item, pos) {
    return packageThings.indexOf(item) == pos;
    })

    var result = '';
    for (let p in packageThings) {
      var color = '';
      if (acceptableThings.includes(packageThings[p])) {
        color = "right";
      }
      else{
        color = "false";
      }
      result += `<li class='${color} result'> ${description[packageThings[p]][0] + ' - ' + description[packageThings[p]][1]}  </li>`
    }
    resElem[0].insertAdjacentHTML('beforeend', result);
}


var DragManager = new function() {

  /**
   * составной объект для хранения информации о переносе:
   * {
   *   elem - элемент, на котором была зажата мышь
   *   avatar - аватар
   *   downX/downY - координаты, на которых был mousedown
   *   shiftX/shiftY - относительный сдвиг курсора от угла элемента
   * }
   */
  var dragObject = {};

  var self = this;

  function onMouseDown(e) {

    if (e.which != 1) return;

    var elem = e.target.closest('.draggable');
    if (!elem) return;

    dragObject.elem = elem;

    // запомним, что элемент нажат на текущих координатах pageX/pageY
    dragObject.downX = e.pageX;
    dragObject.downY = e.pageY;

    return false;
  }

  function onMouseMove(e) {
    if (!dragObject.elem) return; // элемент не зажат

    if (!dragObject.avatar) { // если перенос не начат...
      var moveX = e.pageX - dragObject.downX;
      var moveY = e.pageY - dragObject.downY;

      // если мышь передвинулась в нажатом состоянии недостаточно далеко
      if (Math.abs(moveX) < 3 && Math.abs(moveY) < 3) {
        return;
      }

      // начинаем перенос
      dragObject.avatar = createAvatar(e); // создать аватар
      if (!dragObject.avatar) { // отмена переноса, нельзя "захватить" за эту часть элемента
        dragObject = {};
        return;
      }

      // аватар создан успешно
      // создать вспомогательные свойства shiftX/shiftY
      var coords = getCoords(dragObject.avatar);
      dragObject.shiftX = dragObject.downX - coords.left;
      dragObject.shiftY = dragObject.downY - coords.top;

      startDrag(e); // отобразить начало переноса
    }

    // отобразить перенос объекта при каждом движении мыши
    dragObject.avatar.style.left = e.pageX - dragObject.shiftX + 150 + 'px';
    dragObject.avatar.style.top = e.pageY - dragObject.shiftY + 150 + 'px';

    return false;
  }

  function onMouseUp(e) {
    if (dragObject.avatar) { // если перенос идет
      finishDrag(e);
    }

    // перенос либо не начинался, либо завершился
    // в любом случае очистим "состояние переноса" dragObject
    dragObject = {};
  }

  function finishDrag(e) {
    var dropElem = findDroppable(e);

    if (!dropElem) {
      self.onDragCancel(dragObject);
    } else {
      self.onDragEnd(dragObject, dropElem);
      if (curItems < maxItems) {
          curItems++;

      packageThings.push(dragObject.avatar.getAttribute('name'));

      $('#counter').text(curItems + '/' + maxItems);
    }
    if (curItems == maxItems){
      $('#go').prop('disabled', false);
    }
    }
  }

  function createAvatar(e) {

    // запомнить старые свойства, чтобы вернуться к ним при отмене переноса
    var avatar = dragObject.elem;
    var old = {
      parent: avatar.parentNode,
      nextSibling: avatar.nextSibling,
      position: avatar.position || '',
      left: avatar.left || '',
      top: avatar.top || '',
      zIndex: avatar.zIndex || ''
    };

    // функция для отмены переноса
    avatar.rollback = function() {
      old.parent.insertBefore(avatar, old.nextSibling);
      avatar.style.position = old.position;
      avatar.style.left = old.left;
      avatar.style.top = old.top;
      avatar.style.zIndex = old.zIndex
    };

    return avatar;
  }

  function startDrag(e) {
    var avatar = dragObject.avatar;

    // инициировать начало переноса
    document.body.appendChild(avatar);
    avatar.style.zIndex = 9999;
    avatar.style.position = 'absolute';
  }

  function findDroppable(event) {
    // спрячем переносимый элемент
    dragObject.avatar.hidden = true;

    // получить самый вложенный элемент под курсором мыши
    var elem = document.elementFromPoint(event.clientX, event.clientY);

    // показать переносимый элемент обратно
    dragObject.avatar.hidden = false;

    if (elem == null) {
      // такое возможно, если курсор мыши "вылетел" за границу окна
      return null;
    }

    return elem.closest('.droppable');
  }

  document.onmousemove = onMouseMove;
  document.onmouseup = onMouseUp;
  document.onmousedown = onMouseDown;

  this.onDragEnd = function(dragObject, dropElem) {};
  this.onDragCancel = function(dragObject) {};

};


function getCoords(elem) { // кроме IE8-
  var box = elem.getBoundingClientRect();

  return {
    top: box.top + pageYOffset,
    left: box.left + pageXOffset
  };
}


DragManager.onDragCancel = function(dragObject) {
  dragObject.avatar.rollback();
};

DragManager.onDragEnd = function(dragObject, dropElem) {
  dragObject.elem.style.display = 'none';
  dropElem.classList.add('mark');
  setTimeout(function() {
    dropElem.classList.remove('mark');
  }, 200);
};
