Array.prototype.includes ||
  Object.defineProperty(Array.prototype, 'includes', {
    value: function(e, t) {
      function n(e, t) {
        return (
          e === t ||
          ('number' == typeof e && 'number' == typeof t && isNaN(e) && isNaN(t))
        );
      }
      if (null === this) throw new TypeError('"this" is null or not defined');
      var i = Object(this),
        a = i.length >>> 0;
      if (0 === a) return !1;
      for (
        var o = 0 | t, l = Math.max(o >= 0 ? o : a - Math.abs(o), 0);
        a > l;

      ) {
        if (n(i[l], e)) return !0;
        l++;
      }
      return !1;
    },
  }),
  String.prototype.endsWith ||
    Object.defineProperty(String.prototype, 'endsWith', {
      value: function(e, t) {
        return (
          (void 0 === t || t > this.length) && (t = this.length),
          this.substring(t - e.length, t) === e
        );
      },
    }),
  String.prototype.includes ||
    (String.prototype.includes = function(e, t) {
      return (
        'number' != typeof t && (t = 0),
        t + e.length > this.length ? !1 : -1 !== this.indexOf(e, t)
      );
    });
var PREF = (function() {
    function e(e, t, n, a) {
      function o(e) {
        var a = i[e],
          o = a.category,
          l = a.name;
        if (o && l)
          throw GSP.createError(
            'PREF.checkOnePref found an invalid entry' + o + l
          );
        return o && o === n
          ? a.value
          : !l || (l !== t && l !== t + n)
          ? void 0
          : a.value;
      }
      var l, s;
      n || (n = ''),
        (n = n.toLowerCase()),
        (t = t.toLowerCase()),
        (s = e.getAuthorPreference(t + n, a));
      for (var c = 0; c < i.length; c++)
        if (((l = o(c)), void 0 !== l)) return l;
      return s;
    }
    function t(e) {
      Array.isArray(e) &&
        $.each(e, function() {
          var e = this.category,
            t = this.name,
            n = this.value;
          e && t && ((t += e), (e = void 0)),
            i.push({ category: e, name: t, value: n });
        });
    }
    function n(e, t, n) {
      function i(e) {
        return 0 > e ? 0 : e > v ? v : e;
      }
      function a(e, t, n, a) {
        (t.unit = n),
          (e.style.precision = i(e.style.precision + t.power * a)),
          (e.state.forceDomParse = !0),
          e.labelHasChanged();
      }
      var o,
        l,
        s,
        c = e.data('document'),
        r = c.focusPage,
        d = r.sQuery().prefs(),
        u = d.units[t],
        p = d.precision[t],
        f = 0,
        g = {
          length:
            '[genus="DistanceMeasure"],[genus="DistanceParameter"],[genus="AreaMeasure"],[genus="Function"]',
          angle:
            '[genus="AngleMeasure"],[genus="AngleParameter"],[genus="Function"]',
        },
        v = 7;
      if (n !== u) {
        'pix' === n || 'rad' === u
          ? (f = -2)
          : ('pix' === u || 'rad' === n) && (f = 2),
          (d.units[t] = n),
          (r.spec.preferences.units[t] = n),
          (c.pageData[r.metadata.id].spec.preferences.units[t] = n),
          f &&
            ((o = i(p + f)),
            (d.precision[t] = o),
            (r.spec.preferences.precision[t] = o),
            (c.pageData[r.metadata.id].spec.preferences.precision[t] = o)),
          (l = c.sQuery(g[t]));
        for (var b = 0; b < l.length; b++)
          (s = l[b]),
            s.unitsObject[t] &&
              (a(s, s.unitsObject[t], n, f),
              GSP.isParameter(s) &&
                s.unitsObject[t] &&
                ((s.unitMultiplier = GSP.units.convertToBaseFromUnitObject(
                  1,
                  s.unitsObject
                )),
                (s.isExpressionDirty = !0),
                (s.fnExpression = void 0),
                (s.parsedInfix = void 0),
                (s.uValue = s.value / s.unitMultiplier)),
              s.fnUnits && (s.fnUnits = s.sQuery().prefs().units)),
            s.invalidateGeom();
        r.event(
          'PrefChanged',
          {},
          { category: 'units', pref: t, oldValue: u, newValue: n }
        );
      }
    }
    var i = [];
    return {
      setWebPagePrefs: function(e) {
        t(e);
      },
      shouldEnableForCurrentPage: function(t, n, i) {
        var a = parseInt(i.metadata.id, 10),
          o = e(i.document, n, t, i.metadata.id);
        return (
          o === !0 || (Array.isArray(o) && ('all' === o[0] || o.includes(a)))
        );
      },
      getPref: function(t, n, i) {
        return e(t, n, i);
      },
      setUnitPref: function(e, t, i) {
        n(e, t, i);
      },
    };
  })(),
  WIDGETS = (function() {
    function e(e, t) {
      return (
        (e.prototype = Object.create(t.prototype)),
        (e.prototype.constructor = e),
        t.prototype
      );
    }
    function t(e, n) {
      var i = 12;
      if (e === n) return !0;
      if (!e || !n || 'object' != typeof e || 'object' != typeof n)
        return 'number' == typeof e &&
          'number' == typeof n &&
          e.toPrecision(i) === n.toPrecision(i)
          ? !0
          : !1;
      if (Object.keys(e).length !== Object.keys(n).length) return !1;
      for (var a in e)
        if (e.hasOwnProperty(a) && n.hasOwnProperty(a) && !t(e[a], n[a]))
          return !1;
      return !0;
    }
    function n() {
      return ve ? be.data('document').sQuery.sketch : void 0;
    }
    function i(e) {
      return $(e).closest('.sketch_canvas')[0];
    }
    function a(e) {
      (this.name = e),
        (this.eventName = e + 'Widget'),
        (this.domButtonSelector = '#widget_' + e + 'ButtonID'),
        (this.promptSelector = '#w' + e + 'Prompt'),
        (this.enabled = !0);
    }
    function o(e, t) {
      a.call(this, e, t);
    }
    function l(e) {
      arguments.length && !e
        ? s()
        : (fe.tinyDraggable({ exclude: '.dragExclude' }),
          fe.toggle(!0),
          $('.widget_button').removeClass('widget_button_active'),
          be
            .parent()
            .find('.widget_button')
            .addClass('widget_button_active'));
    }
    function s() {
      fe && fe.toggle(!1),
        $('.widget_button').removeClass('widget_button_active');
    }
    function c() {
      var e,
        t = $('.sketch_canvas');
      ($e.objectColorBox = fe.find('#objectColorCheckbox')[0]),
        ($e.textColorBox = fe.find('#textColorCheckbox')[0]),
        t.on('LoadDocument.WSP', function(e, t) {
          m(t.document.canvasNode[0]), y(t.document);
        }),
        t.on('UnloadDocument.WSP', function(e, t) {
          ye && n() === t.document.focusPage && ye.deactivate();
        }),
        t.on('WillUndoRedo.WSP', b),
        t.on('UndoRedo.WSP', v),
        t.on('WillChangeCurrentPage.WSP', b),
        t.on('DidChangeCurrentPage.WSP', v),
        t.each(function(t, n) {
          var i = $(n).data('document');
          m(n), i && (y(i), e || (e = i));
        }),
        e && v({}, { document: e }),
        t.on('keyup', function(e) {
          return 27 === e.keyCode && ye ? (ye.deactivate(), !0) : void 0;
        });
    }
    function r(e) {
      var t = e.parentNode,
        n = $(t).find('.widget_button');
      return 1 === n.length ? n : void 0;
    }
    function d(e) {
      function t() {
        $('#widget').css({ opacity: 0.25, 'z-index': -1 }),
          ye && ((we = ye), WIDGETS.confirmModality());
      }
      function a() {
        var e = we,
          t = !0;
        $('#widget').css({ opacity: 1, 'z-index': 'none' }),
          we &&
            setTimeout(function() {
              e.activate(n(), t), (we = null);
            }, 5);
      }
      var o = i(e),
        c = o !== ve,
        d = $(o),
        u = d.find('.wsp-tool-column'),
        p = d.data('document'),
        f = p.sQuery.sketch,
        g = f !== he,
        v = r(e),
        b = PREF.getPref(p, 'showWidgetPanelOnPageStart');
      if ('none' === d.css('display') || f === he) return ye;
      var h = !1;
      return (
        Fe.forEach(function(e) {
          e.checkEnablingForCurrentPage(f) && (h = !0);
        }),
        v && v.toggle(h),
        h
          ? (ye && ((we = ye), ye.deactivate()),
            Fe.forEach(function(e) {
              e.setEnablingForCurrentPage(f, e);
            }),
            c &&
              (ve &&
                (be.off('WillPlayTool.WSP'),
                be.off('ToolPlayed.WSP'),
                be.off('ToolAborted.WSP'),
                be.off('StartDragConfirmed.WSP'),
                be.off('EndDrag.WSP')),
              (ve = o),
              (be = $(ve)),
              ge.parent().length && ge.detach(),
              be.on('WillPlayTool.WSP', t),
              be.on('ToolPlayed.WSP', a),
              be.on('ToolAborted.WSP', a),
              be.on('StartDragConfirmed.WSP', t),
              be.on('EndDrag.WSP', a),
              be.on('MergeGobjs.WSP', a)),
            g && d.prepend(ge),
            c &&
              (l(),
              fe.css({ top: d.height() - fe.height() }),
              fe.css(
                u.length
                  ? { left: u[0].offsetWidth - fe[0].offsetWidth + 4 }
                  : { left: -1 }
              )),
            g && ((he = f), Oe.setVisColor(f), l(b)),
            v && v.show(),
            b && we && we.enabled && we.activate(f, we, !0),
            (we = null),
            h && ye)
          : ((ve && o !== ve) || (we || (we = ye), ye && ye.deactivate(), s()),
            !1)
      );
    }
    function u(e) {
      n() !== e && d(e.canvasNode[0]),
        n() === e &&
          ye &&
          ye.preProcessGobj &&
          (e.sQuery('*').each(function(e, t) {
            ye.preProcessGobj(t);
          }),
          (e.isDirty = !0),
          e.setNeedsDisplay());
    }
    function p() {
      return parseFloat(getComputedStyle($('#widget')[0]).fontSize) / 16;
    }
    function f(e, t) {
      (e.checked = t), (e.src = t ? pe + 'checked.png' : pe + 'unchecked.png');
    }
    function g(e) {
      return (
        (e.checked = e.checked ? !1 : !0),
        (e.src = e.checked ? pe + 'checked.png' : pe + 'unchecked.png'),
        e.checked
      );
    }
    function v(e, t) {
      var n = t.document;
      d(n.canvasNode[0]);
    }
    function b() {
      ye && ((we = ye), ye.deactivate());
    }
    function h(e, t) {
      ye && ye.handleTap(e, t);
    }
    function m(e) {
      var t,
        n = r(e);
      n &&
        ((t =
          '<button class="widget_button" onclick="WIDGETS.toggleWidgets(this);">Widgets</button>'),
        n.replaceWith(t));
    }
    function y(e) {
      console.log('widgets.resizeSketchFrame() called;is it needed?');
      var t, n, i, a;
      if (
        ((t = e.canvasNode), (n = t.parent()), n.hasClass('sketch_container'))
      ) {
        if (
          ((i = t.find('.wsp-base-node')),
          (a = n.find('.wsp-base-node').width()))
        )
          a +=
            parseInt(n.css('border-left-width'), 10) +
            parseInt(n.css('border-right-width'), 10);
        else {
          var o;
          (a = e.metadata.width + n.find('.wsp-tool-column').width() + 6),
            (o =
              e.metadata.height - t.find('.wsp-undo-button').outerHeight() - 2),
            t.find('.wsp-user-tools').outerHeight(o),
            t.find('.wsp-base-node').outerWidth(a - 4);
        }
        n.outerWidth(a);
      }
    }
    function w(e) {
      me && me && me !== e && (me.setRenderState('none'), (me = null)),
        e && ((me = e), me.setRenderState(Se));
    }
    function S(e, t) {
      var n = be.find("[wsp-id='" + t.id + "']").not('.wsp-sr-only');
      n[0] && (n.css({ color: e }), n.find('*').css({ color: e }));
    }
    function k(e) {
      me.invalidateAppearance(),
        e &&
          $e.event(
            {},
            { action: 'changed', changes: [{ id: me.id, style: me.style }] }
          );
    }
    function P(e, t) {
      var n = !1,
        i = t || me;
      if (!i) return !1;
      if (i.isOfKind('Text'))
        (n = i.style.color !== e), n && (i.style.color = e);
      else if (i.isOfKind('Button'))
        (n = i.style.label.color !== e), n && (i.style.label.color = e);
      else if (
        i.style.label &&
        i.style.label.showLabel &&
        (n = i.style.label.color !== e)
      )
        return (
          (i.style.label.color = e),
          (i.sQuery.sketch.renderRefCon.label[i.id].color = e),
          !0
        );
      return n && S(e, i), V(i, 'Set color for'), n;
    }
    function T() {
      var e,
        t,
        n = me;
      if (n.oldStyle)
        if (n.isOfKind('Button') || n.isOfKind('Text'))
          (e = n.isOfKind('Text') ? n.oldStyle.color : n.oldStyle.label.color),
            (t = n.isOfKind('Text') ? n.style.color : n.style.label.color);
        else if (n.style.label && n.style.label.showLabel)
          return (
            (n.sQuery.sketch.renderRefCon.label[n.id].color =
              n.style.label.color),
            void n.invalidateAppearance()
          );
      e && t !== e && P(e);
    }
    function C() {
      var e,
        t = Math.floor(Ce / 3);
      switch (Ce - 3 * t) {
        case 0:
          e = 'a';
          break;
        case 1:
          e = 'b';
          break;
        case 2:
          e = 'c';
      }
      return $('.block' + t + e).css('background-color');
    }
    function L(e, t) {
      var n = !1,
        i = me;
      return (
        i &&
          $e.objectColorBox.checked &&
          (i.isOfKind('Text')
            ? (n = P(e, i))
            : (i.setRenderState('none'),
              (n = i.style.color !== e),
              n && ((i.style.color = e), k(t)),
              i.setRenderState(Se))),
        n
      );
    }
    function E(e, t) {
      var n = me;
      (ke = e),
        n &&
          n.style.radius &&
          ke >= 0 &&
          (n.setRenderState('none'),
          (n.style.radius = Le[ke]),
          n.setRenderState(Se),
          k(t));
    }
    function x(e, t, n) {
      var i = me;
      (Te = e),
        (Pe = t),
        i &&
          (i.setRenderState('none'),
          i.isOfGenus('Path') && Te >= 0 && (i.style['line-style'] = Ee[Te]),
          i.style.width && Pe >= 0 && (i.style.width = xe[Pe]),
          i.setRenderState(Se),
          k(n));
    }
    function O(e, t) {
      var n = C(e),
        i = $e.objectColorBox.checked,
        a = $e.textColorBox.checked;
      i && L(n, t && !a), a && P(n, t);
    }
    function _(e, t) {
      var n = $('#lineStyleCheckbox')[0],
        i = $('#widget_lineStyleSelector')[0].style;
      if (0 > e && 0 > t) f(n, !1), (i.display = 'none');
      else {
        ($e.defaultLineThickness = e), ($e.defaultLineStyle = t), f(n, !0);
        var a = 1.25 * e + 1.31,
          o = 3.2 * t + 0.31;
        (i.top = a + 'rem'), (i.left = o + 'rem'), (i.display = 'block');
      }
      x(t, e, 'notify');
    }
    function j(e) {
      var t = $('#pointStyleCheckbox')[0],
        n = $('#pointStyleSelector')[0].style;
      if (0 > e) f(t, !1), (n.display = 'none');
      else {
        ($e.defaultPointStyle = e), f(t, !0);
        var i = 1.25 * e + 1.31;
        (n.top = i + 'rem'), (n.display = 'block');
      }
      E(e, 'notify');
    }
    function W(e, t) {
      var n = $('#widget_colorSelector')[0].style;
      0 > e
        ? ((n.display = 'none'),
          f($e.objectColorBox, !1),
          f($e.textColorBox, !1),
          (Ce = -1))
        : ((Ce = 3 * e + t),
          (n.top = 1.56 * t + 0.13 + 'rem'),
          (n.left = 1.69 * e + 0.1 + 'rem'),
          (n.display = 'block'),
          ($e.defaultColor = { row: t, column: e }),
          $e.textColorBox.checked || f($e.objectColorBox, !0),
          me && O(Ce, 'notify'));
    }
    function F(e) {
      var t = e.style;
      (t.originalColor = t.color),
        t.label && t.label.color && (t.label.originalColor = t.label.color);
    }
    function D(e) {
      var t = e.style;
      if (t.faded)
        throw GSP.createError(
          'visibilityWidget deleteFadeCache() called for a faded object.'
        );
      t.originalColor &&
        (delete t.originalColor,
        t.label && t.label.color && delete t.label.originalColor,
        delete t.faded);
    }
    function G(e) {
      var t = e.style;
      if (t.faded)
        throw GSP.createError(
          'visibilityWidget fade() called for an already-faded object.'
        );
      e.style.originalColor || F(e),
        t.faded ||
          ((t.color = Oe.visColor),
          t.label && t.label.color && (t.label.color = Oe.visColor),
          S(t.color, e),
          (t.faded = !0),
          e.invalidateAppearance());
    }
    function I(e) {
      var t = e.style;
      if (!t.originalColor || !t.faded)
        throw GSP.createError(
          "visibilityWidget unfade() called for an object that isn't faded."
        );
      (t.color = t.originalColor),
        t.label && t.label.color && (t.label.color = t.label.originalColor),
        S(t.color, e),
        (t.faded = !1),
        e.invalidateAppearance();
    }
    function B() {
      n().labelPool.saveState(), (_e.labelPoolSaved = !0);
    }
    function M() {
      _e.labelPoolSaved &&
        (n().labelPool.restoreSavedState(), (_e.labelPoolSaved = !1));
    }
    function N() {
      _e.labelPoolSaved &&
        (me.sQuery.sketch.labelPool.forgetSavedState(),
        (_e.labelPoolSaved = !1));
    }
    function R(e) {
      var t = _e.inputElt;
      'string' == typeof e && t.val(e),
        t.focus(),
        t[0].setSelectionRange(0, t.val().length);
    }
    function U(e) {
      var t;
      B(),
        (t = n().labelPool.generateLabel(e.kind, e.genus)),
        e.hasLabel
          ? e.setLabel(t, { showLabel: !0, wasUserInitiated: !0 })
          : (e.label = t),
        R(t);
    }
    function A(e) {
      var t = e.sQuery.sketch,
        n = X(e),
        i = n['font-family'];
      return (
        'number' == typeof i &&
          (i >= t.document.resources.fontList.length && (i = 0),
          (i = t.document.resources.fontList[i]),
          (n['font-family'] = i)),
        i
      );
    }
    function z(e) {
      var t = '';
      return (
        e.genus.includes('Measure')
          ? (t = 'measure')
          : e.genus.includes('Parameter')
          ? (t = 'param')
          : e.useTransformLabel && e.useTransformLabel() && (t = 'transImage'),
        t
      );
    }
    function V(e, t) {
      var n,
        i,
        a = be.find("[wsp-id='" + e.id + "']"),
        o = X(e)['font-family'],
        l = X(e)['font-size'],
        s = X(e).color,
        c = e.sQuery.sketch,
        r = c.renderRefCon,
        d = e.hasLabel ? r.label[e.id] : r.gobj[e.id],
        u = { label: e.label };
      _e.defineControls(),
        (e.parsedMFS = null),
        e.hasLabel
          ? (Q(
              d,
              'invalidateLabel passed a labeled gobj with no renderRefCon.label'
            ),
            (d['font-family'] = o),
            (d['font-size'] = l),
            (i = r.labelBounds[e.id]),
            i && c.invalidateRect(i),
            (e.state.labelPreRenderJITPrepareDone = !1),
            e.labelPreRenderJITPrepare(
              c.dcForGObjLabel(e, 'normal'),
              c.renderRefCon.label[e.id]
            ))
          : ((n = d.css),
            (d = d.baseStyles),
            Q(
              1 === a.length,
              'invalidateLabel should find a single matching node.'
            ),
            (n['font-family'] = o),
            (n['font-size'] = l),
            (n.color = s),
            (d['font-family'] = o),
            (d['font-size'] = l),
            (d.color = s),
            a.css({ 'font-size': l, 'font-family': o }),
            $(a)
              .find('[style*="font-family"]')
              .css('font-family', o),
            (e.state.forceDomParse = !0),
            e.descendantLabelGraphHasChanged(),
            _e.showLabelElt.prop(
              'checked',
              'noVisibleName' !== e.style.nameOrigin
            )),
        t && (u.action = t),
        e.invalidateAppearance(),
        _e.event(
          {},
          {
            action: t,
            gobjId: e.id,
            text: e.label,
            labelStyle: e.style.label,
            labelSpec: e.labelSpec,
          }
        );
    }
    function K(e, t, n) {
      function i() {
        Q(!n, "A button or function shouldn't have a nameOrigin."),
          e.shouldAutogenerateLabel && (e.shouldAutogenerateLabel = !1),
          o && ((t = ' '), R(t)),
          (e.label = t),
          e.messages && (e.messages = []);
      }
      function a() {
        (e.label = t),
          (t = t.replace(/'/g, "\\'")),
          (e.textMFS = "<VL<T'" + t + "'>>");
      }
      var o = !t || '' === t,
        l = void 0 === e.style.nameOrigin || n === e.style.nameOrigin;
      return (
        _e.defineControls(),
        t || (t = ''),
        e.label === t && l
          ? t
          : (o && M(),
            n && (e.style.nameOrigin = n),
            e.hasLabel
              ? ((e.shouldAutogenerateLabel = [
                  'namedByPrime',
                  'namedByShortFn',
                  'namedByFullFn',
                  'namedFromTemplate',
                ].includes(n)),
                o && (t = e.label),
                e.setLabel(t, { showLabel: o ? !1 : !0, wasUserIntiated: !0 }),
                (_e.showLabelElt[0].checked = o ? !1 : !0),
                (t = e.label))
              : e.isOfKind('Button') || e.isOfGenus('Function')
              ? i()
              : 'Caption' === e.genus
              ? a()
              : 'namedFromLabel' === n &&
                (o ? (U(e), (t = e.label)) : (e.label = t)),
            V(e, 'Changed'),
            t)
      );
    }
    function H() {
      $('#wLabelPrompt').css('display', 'none'),
        $('#wLabelPane').css('display', 'block');
    }
    function Q(e, t) {
      e || t || (t = 'Unidentified error');
    }
    function J(e, t) {
      var n = me,
        i = {},
        a = _e.touchPos,
        o = n.style.label,
        l = o && o.showLabel;
      n.hasLabel && !n.label && (U(n), (t = 'Generated')),
        void 0 === e &&
          (n.hasLabel
            ? (e = !o.showLabel)
            : _e.nameClass &&
              n.style.nameOrigin &&
              (e = 'noVisibleName' !== n.style.nameOrigin),
          (t = t || e ? 'Showed' : 'Hid')),
        n.hasLabel
          ? ((o.showLabel = e),
            (t && 'Tapped' !== t) || l === e || (t = e ? 'Showed' : 'Hid'),
            e &&
              !l &&
              (n.isAPath() &&
                (n.labelRenderBounds ||
                  (n.labelRenderBounds = Y(
                    n.sQuery.sketch.renderRefCon.labelBounds[n.id]
                  )),
                _e.isTap &&
                  ((i.x = a.x - n.labelRenderBounds.left),
                  (i.y = a.y - n.labelRenderBounds.top),
                  (t = t || 'Moved'))),
              _e.isTap &&
                ((i = o.labelOffsetX
                  ? {
                      x: -o.labelOffsetX + a.x - n.labelSpec.location.x,
                      y: -o.labelOffsetY + a.y - n.labelSpec.location.y,
                    }
                  : { x: o['font-size'], y: +o['font-size'] / 2 }),
                n.setLabelPosition(a, i),
                (t = t || 'Modified')),
              '' === _e.inputElt[0].value && R(n.label)))
          : _e.nameClass &&
            n.style.nameOrigin &&
            LabelControls.labelChanged(e ? n.label : ''),
        _e.showLabelElt.prop('checked', e),
        V(n, t);
    }
    function Y(e, t) {
      return (
        t || (t = {}),
        (t.top = e.top),
        (t.bottom = e.bottom),
        (t.left = e.left),
        (t.right = e.right),
        t
      );
    }
    function X(e) {
      var t = e.style.label;
      return (!t || $.isEmptyObject(t)) && (t = e.style), t;
    }
    function Z(e) {
      var t,
        n = A(e);
      return (
        (t = n.substring(0, 1)),
        '"' === t || "'" === t
          ? (n = n.split(t)[1])
          : n.indexOf(',') && (n = n.split(',')[0]),
        n
      );
    }
    function q() {
      var e,
        t,
        n,
        i = $.makeArray($('script[src]'));
      for (e = 0; e < i.length; e++)
        if (((t = i[e]), t.src && t.src.endsWith('/widgets.js')))
          return (n =
            t.src
              .split('?')[0]
              .split('/')
              .slice(0, -1)
              .join('/') + '/');
    }
    function ee(e) {
      var t = '',
        n = '',
        i = _e.inputElt[0],
        a = i.selectionStart,
        o = i.selectionEnd,
        l = i.value;
      a > 0 && (t = l.slice(0, a)),
        o < l.length && (n = l.slice(o)),
        (l = t + e + n),
        WIDGETS.labelChanged(l),
        (i.value = l),
        (o = t.length + e.length),
        i.focus(),
        i.setSelectionRange(o, o);
    }
    function te(e) {
      return !(
        e.isOfKind('Text') ||
        e.isOfKind('AngleMarker') ||
        e.isOfKind('PathMarker') ||
        e.isOfKind('Button') ||
        e.isOfKind('CoordSys') ||
        e.isOfKind('DOMKind') ||
        e.isOfKind('IterateImage') ||
        e.isOfKind('Map') ||
        e.isOfKind('Picture')
      );
    }
    function ne() {
      var e,
        t,
        n = he.MotionManager.motionList;
      for (e = 0; e < n.length; e++)
        if (((t = he.MotionManager.motionSet[n[e]]), t && 'active' === t.state))
          return !1;
      return !0;
    }
    function ie() {
      !Ie.checked || (!ne() && De.checked)
        ? ae('force')
        : (je.setTraceRenderState(!0),
          je.event({}, { action: 'glowing', glowing: !0 }));
    }
    function ae(e) {
      var t = De.checked,
        n = 'force' === e;
      (t || n) &&
        (je.setTraceRenderState(!1),
        je.event({}, { action: 'glowing', glowing: !1 }));
    }
    function oe() {
      be.on('StartDragConfirmed.WSP', ae),
        be.on('EndDrag.WSP', ie),
        be.on('MergeGobjs.WSP', ie),
        be.on('StartAnimate.WSP', ae),
        be.on('EndAnimate.WSP', ie),
        be.on('StartMove.WSP', ae),
        be.on('EndMove.WSP', ie);
    }
    function le() {
      be.off('StartDragConfirmed.WSP'),
        be.off('EndDrag.WSP'),
        be.off('MergeGobjs.WSP'),
        be.off('StartAnimate.WSP'),
        be.off('EndAnimate.WSP'),
        be.off('StartMove.WSP'),
        be.off('EndMove.WSP');
    }
    function se(e, t) {
      $.each(e, function(e, n) {
        n.setRenderState(t);
      });
    }
    function ce() {
      var e =
        '<div id="widget" class="clearfix">    <div id="widget_control" class="widget_controlWidth">      <div class="widget_handle"></div>      <button id="widget_StyleButtonID" class="widget_controlButton widgettip" onclick="WIDGETS.toggleStyleModality();"><span class="widgettiptext">Style Widget</span><img class="widget_controlIcon" src="./widgets/style-icon.png"></button>      <button id="widget_TraceButtonID" class="widget_controlButton widgettip" onclick="WIDGETS.toggleTraceModality();"><span class="widgettiptext">Trace Widget</span><img class="widget_controlIcon" src="./widgets/trace-icon.png"></button>      <button id="widget_LabelButtonID" class="widget_controlButton widgettip" onclick="WIDGETS.toggleLabelModality();"><span class="widgettiptext">Label Widget</span><img class="widget_controlIcon" src="./widgets/label-icon.png"></button>      <button id="widget_VisibilityButtonID" class="widget_controlButton widgettip" onclick="WIDGETS.toggleVisibilityModality();"><span class="widgettiptext">Visibility Widget</span><img class="widget_controlIcon" src="./widgets/visibility-icon.png"></button>      <button id="widget_DeleteButtonID" class="widget_controlButton widgettip" onclick="WIDGETS.toggleObjectModality();"><span class="widgettiptext">Delete Widget</span><img class="widget_controlIcon" src="./widgets/delete-icon.png"></button>    </div>    <div id="wStylePane">      <div class="widgetPane widget_pointPaneWidth">        <img id="pointStyleCheckbox" class="style_paneCheckbox" onclick="WIDGETS.pointCheckClicked(event);" src="./widgets/unchecked.png">        <div class="style_paneBackground  widget_pointImgWidth"></div>        <img class="style_paneContent widget_pointImgWidth" onclick="WIDGETS.pointGridClicked(event);" src="./widgets/pointstyle-grid.png">        <div id="pointStyleSelector" class="style_paneSelector">&nbsp;</div>      </div>      <div id="widget_lineStylePane" class="widgetPane">        <img id="lineStyleCheckbox" class="style_paneCheckbox" onclick="WIDGETS.lineCheckClicked(event);" src="./widgets/unchecked.png">        <div class="style_paneBackground widget_lineStyleWidth"></div>        <img class="style_paneContent widget_lineStyleWidth" onclick="WIDGETS.lineGridClicked(event);" src="./widgets/linestyle-grid.png">        <div id="widget_lineStyleSelector" class="style_paneSelector">&nbsp;</div>      </div>      <div id="widget_colorPane" class="widgetPane">        <img id="objectColorCheckbox" class="style_paneCheckbox" onclick="WIDGETS.colorCheckClicked(event);" src="./widgets/unchecked.png">        <img class="widget_colorIcon" src="./widgets/object-icon.png">        <img id="textColorCheckbox" class="style_paneCheckbox" onclick="WIDGETS.labelCheckClicked(event);" src="./widgets/unchecked.png">        <img class="widget_colorIcon" src="./widgets/text-icon.png">        <div id="widget_colorGrid" class="style_paneBackground" onclick="WIDGETS.colorGridClicked(event);">          <div class="widget_color_column" style="left:0px;">            <div class="block0a"></div>            <div class="block0b"></div>            <div class="block0c"></div>          </div>          <div class="widget_color_column" style="left:27px;">            <div class="block1a"></div>            <div class="block1b"></div>            <div class="block1c"></div>          </div>          <div class="widget_color_column" style="left:54px;">            <div class="block2a"></div>            <div class="block2b"></div>            <div class="block2c"></div>          </div>          <div class="widget_color_column" style="left:81px;">            <div class="block3a"></div>            <div class="block3b"></div>            <div class="block3c"></div>          </div>          <div class="widget_color_column" style="left:108px;">            <div class="block4a"></div>            <div class="block4b"></div>            <div class="block4c"></div>          </div>          <div class="widget_color_column" style="left:135px;">            <div class="block5a"></div>            <div class="block5b"></div>            <div class="block5c"></div>          </div>          <div class="widget_color_column" style="left:162px;">            <div class="block6a"></div>            <div class="block6b"></div>            <div class="block6c"></div>          </div>          <div class="widget_color_column" style="left:189px;">            <div class="block7a"></div>            <div class="block7b"></div>            <div class="block7c"></div>          </div>          <div class="widget_color_column" style="left:216px;">            <div class="block8a"></div>            <div class="block8b"></div>            <div class="block8c"></div>          </div>          <div id="widget_colorSelector" class="style_paneSelector">&nbsp;          </div>        </div>      </div>      <div class="widgetPane wDismissPane">        <img class="wDismissButton confirm_button" onclick="WIDGETS.confirmModality();" src="./widgets/confirm.png">        <img class="wDismissButton cancel_button" onclick="WIDGETS.cancelModality();" src="./widgets/cancel.png">      </div>    </div>        <div id="wTracePane">      <div class="wTraceControls widgetPane">        Tracing:<br>        <label>          <input type="checkbox" id="wTraceEnabled" value="off" onClick="WIDGETS.setTraceEnabling(this.checked)"> Enabled        </label>        <label>          <input type="checkbox" id="wTraceFading" value="off" onClick="WIDGETS.setTraceFading(this.checked);"> Fading        </label><br>        <button type="button" id="wEraseTraces" onClick="WIDGETS.clearTraces();">Erase Traces</button><br>        <label>          <input type="checkbox" id="wTracesGlowing" onClick="WIDGETS.setTraceGlowing(this.checked);"> Traced Objects Glow        </label>      </div>      <div id="wTracePrompt" class="widgetPane wPrompt" onclick="this.style.display = \'none\';">        Tap an object to turn its tracing on<br>        or off. Check <em>Traced Objects Glow</em><br>        to show what is being traced.      </div>    </div>        <div id="wLabelPane">      <div class="wLabelControls widgetPane">        <div>          <div class="labelCombo labelSizeCombo">            <select class="labelFontSize dragExclude" onchange="this.nextElementSibling.value=this.value; WIDGETS.labelSetFontSize (this.value);">                <option value=""> </option>                <option value="9">9</option>                <option value="10">10</option>                <option value="12">12</option>                <option value="14">14</option>                <option value="16">16</option>                <option value="18">18</option>                <option value="24">24</option>                <option value="36">36</option>            </select>            <input id="wLabelFontSize" class="labelFontSize dragExclude" type="text" name="labelFontSize" value="" oninput="WIDGETS.labelSetFontSize (this.value);" onchange="WIDGETS.labelSetFontSize (this.value);"/>          </div>          <div class="labelCombo labelFontCombo">            <select id="wLabelFont" class="input labelFont dragExclude"  onchange="WIDGETS.labelSetFont (this.value);">              <optgroup label="Sans Serif">                <option value="Arial, Helvetica, sans-serif">Arial</option>                <option value="\'Comic Sans MS\', cursive, sans-serif">Comic Sans MS</option>                <option value="Impact, Charcoal, sans-serif">Impact</option>                <option value="\'Lucida Sans Unicode\', \'Lucida Grande\', sans-serif">Lucida Sans Unicode</option>                <option value="Tahoma, Geneva, sans-serif">Tahoma</option>                <option value="\'Trebuchet MS\', Helvetica, sans-serif">Trebuchet MS</option>                <option value="Verdana, Geneva, sans-serif">Verdana</option>              </optgroup>              <optgroup label="Serif">                <option value="Garamond, serif">Garamond</option>                <option value="Georgia, serif">Georgia</option>                <option value="Palatino, \'Palatino Linotype\', \'Book Antiqua\', serif">Palatino</option>                <option value="\'Times New Roman\', Times, serif">Times New Roman</option>              </optgroup>              <optgroup label="Mono-spaced">                <option value="Courier, \'Courier New\', monospace">Courier</option>                <option value="Monaco, \'Lucida Console\', monospace">Monaco</option>              </optgroup>            </select>                   </div>                  <div class="wCharDropdown">            <div class="wCharDropbtn">              <span class="caret"></span>             </div>            <div class="wCharDropdownContent dragExclude">              <div class="column">                <div>&#9651;</div>                <div>&#9651;</div>                <div>&#10178;</div>                <div>&#8214;</div>                <div>&ang;</div>                <div>&#8857;</div>                <div>&deg;</div>                <div>&cong;</div>                <div>&asymp;</div>                <div>&ne;</div>                <div>&le;</div>                <div>&ge;</div>                <div>&sim;</div>              </div>              <div class="column">                <div>&pi;</div>                <div>&theta;</div>                <div>&alpha;</div>                <div>&beta;</div>                <div>&gamma;</div>                <div>&delta;</div>                <div>&epsilon;</div>                <div>&phi;</div>                <div>&tau;</div>                <div>&Delta;</div>                <div>&Sigma;</div>                <div>&Pi;</div>              </div>              <div class="column">                <div>&ndash;</div>                <div>&middot;</div>                <div>&plusmn;</div>                <div>&divide;</div>                <div>&int;</div>                <div>&bull;</div>                <div>&rarr;</div>                <div>&rArr;</div>                <div>&there4;</div>                <div>&exist;</div>                <div>&forall;</div>                <div>&infin;</div>              </div>            </div>          </div>        </div>        <div>          <span id="wLabelEditLabel">Label: </span><br>          <input id="wLabelEditText" class="dragExclude" oninput="WIDGETS.labelChanged (this.value);"><br>        </div>        <div id="wShowLabelButton">          <label><input id="wLabelShow" type="checkbox" onclick="WIDGETS.labelToggled(this.checked);"> Show Label</label> &nbsp; &nbsp;        </div>      </div>            <div id="measureButtons" class="widgetPane wNameOrigin3 wLabelRadios">        <label class="radio-inline " >          <input type="radio" name="measureStyle" value="namedFromTemplate"> Auto        </label>        <br>        <label class="radio-inline" >          <input type="radio" name="measureStyle" value="namedFromLabel"> Manual        </label>        <br>        <label class="radio-inline" >          <input type="radio" name="measureStyle" value="noVisibleName"> None        </label>      </div>      <div id="paramButtons" class="widgetPane wNameOrigin2 wLabelRadios">        <label class="radio-inline" >          <input type="radio" name="measureStyle" value="namedFromLabel"> Manual        </label>        <br>        <label class="radio-inline" >          <input type="radio" name="measureStyle" value="noVisibleName"> None        </label>      </div>      <div id="transImageButtons" class="widgetPane wNameOrigin4 wLabelRadios">        <label class="radio-inline">          <input type="radio" name="notationStyle" value="namedByPrime"> Prime        </label>        <br>        <label class="radio-inline">          <input type="radio" name="notationStyle" value="namedByShortFn"> Short        </label>        <br>        <label class="radio-inline">          <input type="radio" name="notationStyle" value="namedByFullFn"> Full        </label>        <br>        <label class="radio-inline">          <input type="radio" name="notationStyle" value="namedFromLabel"> Manual        </label>      </div>      <div class="widgetPane wDismissPane">        <img class="wDismissButton confirm_button" onclick="WIDGETS.confirmModality();" src="./widgets/confirm.png">        <img class="wDismissButton cancel_button" onclick="WIDGETS.cancelModality();" src="./widgets/cancel.png">      </div>    </div>    <div id="wLabelPrompt" class="widgetPane wPrompt">Tap an object or label to show or change      <br>the label. Tap again to hide the label.      <br>Tap one label, then another, to copy the style.    </div>      <div id="wVisibilityPrompt" class="widgetPane wPrompt" onclick="this.style.display = \'none\';">        Hidden objects appear faded (gray).<br>        Tap an object to change its visibility.<br>        Tap the visibility icon (<img src="./widgets/visibility-icon.png" id="wVisIcon">) when done.      </div>    <div id="wDeletePrompt" class="widgetPane wPrompt">Tap an object to delete it      <br>along with all the objects      <br>that depend on it.    </div>  </div>  <div class="util-popup" id="delete-confirm-modal">  <div class="util-popup-content">    <div class="util-popup-title">Delete Highlighted Objects?</div>    <div class = "util-popup-legend">All highlighted objects will be deleted.</div>    <div class="clearfix"></div>    <input type="button" id="deleteConfirm" class="close util-popup-button dragExclude" onclick="WIDGETS.deleteConfirm();" value="Delete" />    <input type="button" id="deleteCancel" class="close util-popup-button dragExclude" onclick="WIDGETS.deleteCancel();" value="Cancel" />    <div class="clearfix"></div>  </div></div><div class="util-popup" id="download-modal">  <div class="util-popup-content clearfix">    <div class="util-popup-title">Download Sketch File</div>    <p class = "util-popup-legend">The file will be stored with your Downloads.</p>    <p class = "util-popup-legend">The filename must end with ".json" or "-json.js".</p>    <p class = "util-popup-legend">(No spaces or commas allowed with "-json.js".)</p>    <div class="util-div-fname">      <label for="util-fname">Name: </label>      <input id = "util-fname" type="text" placeholder="file name (no spaces)" required         pattern="(^[a-zA-Z0-9]([a-zA-Z0-9_-])*.json)|(^[a-zA-Z0-9]([a-zA-Z0-9_-])*-json.js)$"        title="Must end with \'.json\' or \'-json.js\'"        oninput="UTILMENU.checkFName(this.validity);"/>      <span class="validity"></span>    </div>    <input type="button" id="downloadOK" class="close util-popup-button" value="OK" disabled />    <input type="button" class="close util-popup-button" value="Cancel" onclick="UTILMENU.closeModal (\'download-modal\', \'cancel\');" />  </div></div><div class="util-popup" id="upload-modal">  <div class="util-popup-content">    <div class="util-popup-title">Upload New Sketch</div>    <p class = "util-popup-legend">Your sketch has unsaved changes. Do you want to download it first, before uploading a new sketch?</p><br>    <div class="util-popup-button">      <input type="button" id="downloadBeforeUpload" class="close util-popup-button" value="Download this sketch" onclick="UTILMENU.closeModal (\'upload-modal\', \'save\');"/>      <input type="button" class="close util-popup-button" value="Upload new sketch" onclick="UTILMENU.closeModal (\'upload-modal\', \'dont-save\');" />      <input type="button" class="close util-popup-button" value="Cancel" onclick="UTILMENU.closeModal (\'upload-modal\', \'cancel\');" />    </div>  </div></div><input type="file" id="file-name-input" accept=".json,.js" /><br><a id="downloadLink" href="" download="">Download</a><br>';
      return e;
    }
    function re() {
      var e = fe.find('.wCharDropdownContent .column div');
      $._data(e[0], 'events')
        ? console.log('setupDropdownHandlers() should not be called twice.')
        : e.click(function() {
            ee(this.innerText);
          });
    }
    function de(e) {
      var t = $('<div>');
      return (
        (pe = q()),
        fe
          ? void console.log('makeWidget() should not be called twice.')
          : (t.append(e),
            (fe = t.find('#widget')),
            (ge = $(
              "<div style='position: relative; height:0; width:100%;'></div>"
            )),
            fe.appendTo(ge),
            t.appendTo($('body')),
            fe.css('display', 'none'),
            c(),
            re(),
            void fe.find('img').attr('src', function(e, t) {
              var n = t.match(/[^\/]+$/);
              return pe + n;
            }))
      );
    }
    function ue() {
      de(ce());
    }
    var pe,
      fe,
      ge,
      ve,
      be,
      he,
      me,
      ye,
      we,
      Se = 'fadeInOut',
      ke = -1,
      Pe = -1,
      Te = -1,
      Ce = -1,
      Le = [1.5, 2, 4, 6],
      Ee = ['solid', 'dashed', 'dotted'],
      xe = [0.5, 1, 3, 5];
    (a.prototype.event = function(e, t) {
      (t = t || {}),
        (e = e || {}),
        (e.widget = this),
        me && ((e.target = me), t.gobjId || (t.gobjId = me.id)),
        n().event(this.eventName, e, t);
    }),
      (a.prototype.activate = function(e, t, n) {
        var i = { action: 'activate' };
        return (
          ye && ye !== t && ye.deactivate(),
          e.document.isCurrentlyInToolplay()
            ? !1
            : ((ye = t),
              (t.active = !0),
              $(t.domButtonSelector).addClass('widget_active'),
              (i.restoring = n),
              $(t.promptSelector).css('display', 'block'),
              (i.promptDisplay = 'block'),
              $('.widgetPane').on('keyup', function(e) {
                27 === e.keyCode && ye.deactivate();
              }),
              t.event({ widget: t }, i),
              !0)
        );
      }),
      (a.prototype.deactivate = function(e) {
        var t = { widget: e },
          n = { action: 'deactivate', promptDisplay: 'none' };
        e === ye && (ye = null),
          (e.active = !1),
          $(e.domButtonSelector).removeClass('widget_active'),
          $('.widgetPane').off('keyup'),
          e.changes &&
            ((n.changes = e.changes), e.cancelOnExit && (n.canceled = !0)),
          e.event(t, n);
      }),
      (a.prototype.toggle = function(e, t) {
        this === ye ? this.deactivate(t) : this.activate(e, t);
      }),
      (a.prototype.checkEnablingForCurrentPage = function(e) {
        var t;
        return (
          (t = PREF.shouldEnableForCurrentPage('widget', this.name, e)),
          'trace' === this.name && (t = t && e.preferences.tracesEnabled),
          t
        );
      }),
      (a.prototype.setEnablingForCurrentPage = function(e, t) {
        var n = this.checkEnablingForCurrentPage(e);
        return (
          (t.enabled = n),
          n
            ? $(t.domButtonSelector).show()
            : (this === ye && t.deactivate(),
              fe.find(t.domButtonSelector).hide()),
          n
        );
      }),
      e(o, a),
      (o.prototype.preProcessGobj = function(e) {}),
      (o.prototype.postProcessGobj = function(e) {}),
      (o.prototype.activate = function(e, t, n) {
        var i = $('.sketch_canvas'),
          a = e.hasTouchRegimes() && e.currentTouchRegime();
        return Object.getPrototypeOf(this).activate(e, t, n)
          ? ((i = $('.sketch_canvas')),
            i.on('Tap.WSP', h),
            a && 'DisplayRegime' === a.name && a.allowUnselectableTap(!0),
            u(e),
            !0)
          : !1;
      }),
      (o.prototype.deactivate = function(e) {
        var t = n(),
          i = $('.sketch_canvas'),
          a = t.hasTouchRegimes() && t.currentTouchRegime();
        i.off('Tap.WSP', h),
          i.off('WillUndoRedo.WSP', b),
          i.off('UndoRedo.WSP', v),
          ye && ye.postProcessSketch && ye.postProcessSketch(this),
          a && 'DisplayRegime' === a.name && a.allowUnselectableTap(!1),
          Object.getPrototypeOf(this).deactivate(e);
      }),
      (o.prototype.handleTap = function(e, t) {
        var n = i(t.document.canvasNode[0]);
        return n === ve || d(n) ? t.gobj : null;
      });
    var $e = new o('Style');
    ($e.cancelOnExit = !1),
      ($e.defaultColor = { row: 0, column: 1 }),
      ($e.defaultPointStyle = 2),
      ($e.defaultLineThickness = 2),
      ($e.defaultLineStyle = 0);
    var Oe = new o('Visibility'),
      _e = new o('Label');
    (_e.labelPoolSaved = !1),
      (_e.touchPos = GSP.GeometricPoint(0, 0)),
      (_e.textRule = null);
    var je = new o('Trace'),
      We = new o('Delete'),
      Fe = [$e, je, _e, Oe, We];
    (o.prototype.postProcessSketch = function() {
      var e = n(),
        t = [];
      return (
        ye &&
          ye.postProcessGobj &&
          (e.sQuery('*').each(function(e, n) {
            var i = ye.postProcessGobj(n);
            i && ((i.id = n.id), t.push(i));
          }),
          t.length && (this.changes = t),
          (e.isDirty = !0)),
        !0
      );
    }),
      ($e.activate = function(e, t) {
        return Object.getPrototypeOf(this).activate(e, this, t)
          ? ((this.cancelOnExit = !1),
            $('#wStylePane').css('display', 'block'),
            !0)
          : !1;
      }),
      ($e.deactivate = function() {
        Object.getPrototypeOf(this).deactivate(this),
          $('#wStylePane').css('display', 'none'),
          (this.cancelOnExit = !1),
          w(null);
      }),
      ($e.postProcessGobj = function(e) {
        var t,
          n = $e.cancelOnExit;
        return (
          e.oldStyle &&
            (n &&
              ((e.style = e.oldStyle),
              T(),
              e.sQuery.sketch.invalidateAppearance(e)),
            (t = { style: jQuery.extend(!0, {}, e.style) }),
            delete e.oldStyle),
          Object.getPrototypeOf($e).postProcessGobj(e),
          t
        );
      }),
      ($e.handleTap = function(e, t) {
        var n,
          i = {};
        (n = Object.getPrototypeOf($e).handleTap(e, t)),
          n &&
            (w(n),
            n.oldStyle || (n.oldStyle = jQuery.extend(!0, {}, n.style)),
            E(ke),
            x(Te, Pe),
            Ce >= 0 && O(Ce),
            (i.id = n.id),
            (i.style = n.style),
            this.event({}, { action: 'changed', changes: [i] }));
      }),
      (Oe.activate = function(e, t) {
        return Object.getPrototypeOf(this).activate(e, this, t) ? !0 : !1;
      }),
      (Oe.deactivate = function() {
        $('#wVisibilityPrompt').css('display', 'none'),
          Object.getPrototypeOf(this).deactivate(this);
      }),
      (Oe.preProcessGobj = function(e) {
        'byUser' === e.style.hidden &&
          (e.show(),
          e.sQuery.sketch.constrainAndRedraw(),
          G(e),
          (e.wasHidden = !0)),
          Object.getPrototypeOf(Oe).preProcessGobj(e);
      }),
      (Oe.postProcessGobj = function(e) {
        var t,
          n,
          i = e.style;
        return (
          i.faded && (e.hide('byUser'), I(e), (t = !0)),
          D(e),
          (n =
            (e.style.hidden && !e.wasHidden) ||
            (!e.style.hidden && e.wasHidden)),
          Object.getPrototypeOf(Oe).postProcessGobj(e),
          e.wasHidden && delete e.wasHidden,
          n
        );
      }),
      (Oe.handleTap = function(e, t) {
        var n = Object.getPrototypeOf(Oe).handleTap(e, t),
          i = {};
        n &&
          (n.style.faded ? I(n) : G(n),
          $('#wVisibilityPrompt').css('display', 'none'),
          (i.id = n.id),
          (i.style = n.style),
          this.event({}, { action: 'changed', changes: [i] }));
      }),
      (Oe.setVisColor = function(e) {
        var t = 'rgb(192,192,192)',
          n = e.preferences.colorableComponents.Background.color;
        if (n) {
          var i = document.createElement('div');
          i.style.color = n;
          var a = window.getComputedStyle(i).color;
          if ('rgb' === a.substring(0, 3)) {
            var o = a.split('(')[1].split(')')[0];
            (o = o.split(',')), (t = 'rgb(');
            for (var l = 0; 3 > l; l++)
              (t += o[l] < 128 ? o[l] + 64 : o[l] - 32), 2 > l && (t += ',');
            t += ')';
          }
        }
        Oe.visColor = t;
      }),
      (_e.cacheProperties = function(e) {
        (this.oldLabel = 'Caption' === e.genus ? e.textMFS : e.label),
          (this.oldAutogenerate = e.shouldAutogenerateLabel),
          A(e),
          (this.oldStyle = $.extend(!0, {}, e.style));
      }),
      (_e.emptyCache = function() {
        delete this.oldLabel, delete this.oldAutogenerate, delete this.oldStyle;
      }),
      (_e.setAction = function(e) {
        (this.prevAction = ''),
          (this.prevAction = this.action),
          (this.action = e);
      }),
      (_e.clear = function(e) {
        this.emptyCache(),
          N(),
          R(''),
          $('#measureButtons, #transImageButtons, #paramButtons').toggle(!1),
          e !== !1 &&
            (_e.sizeElt.val(''),
            _e.fontElt.val(''),
            _e.showLabelElt.prop('checked', !1));
      }),
      (_e.finalizeLabel = function() {
        var e,
          n,
          i,
          a = me;
        a &&
          ((i = { action: 'Finalized' }),
          (n = 'Caption' === a.genus ? a.textMFS : a.label),
          n !== this.oldLabel && (i.text = n),
          this.oldAutogenerate !== a.shouldAutogenerateLabel &&
            (i.autoGenerate = a.shouldAutogenerateLabel),
          t(this.oldStyle.label, a.style.label) ||
            (i.labelStyleJson = JSON.stringify(a.style.label)),
          a.hasLabel &&
            a.style.nameOrigin &&
            ((e = LabelControls.originFromText(a.label)),
            e &&
              a.style.nameOrigin !== e &&
              ((a.style.nameOrigin = e), (i.nameOrigin = e))),
          this.event({}, i),
          this.emptyCache());
      }),
      (_e.restoreLabel = function(e) {
        e &&
          (e.style && (e.style = $.extend(!0, {}, _e.oldStyle)),
          'Caption' === e.genus
            ? ((e.textMFS = _e.oldLabel), delete e.label)
            : _e.oldLabel
            ? ((e.label = _e.oldLabel ? '' : ' '),
              K(me, _e.oldLabel, e.style.nameOrigin),
              (e.shouldAutogenerateLabel = _e.oldAutogenerate))
            : (delete e.label,
              (e.shouldAutogenerateLabel = _e.oldAutogenerate)),
          M(),
          V(e, 'Restored ')),
          this.emptyCache();
      }),
      (_e.handleTap = function(e, n) {
        function i() {
          function e() {
            function e() {
              function e(e) {
                var t = { init: !0 };
                return (
                  (c.style.nameOrigin === e ||
                    (!l.label && 'namedFromLabel' !== c.style.nameOrigin)) &&
                    (t.create = !0),
                  c.makeParentalLabel(e, t)
                );
              }
              var t, n, i, l;
              (c.isTransformationConstraint || c.state.labelParent) &&
                ((l = c.isTransformationConstraint
                  ? c.parents.source
                  : c.state.labelParent),
                (t = e('namedByPrime')),
                (n = e('namedByShortFn')),
                (i = e('namedByFullFn'))),
                (o[t] = 'namedByPrime'),
                (o[n] = 'namedByShortFn'),
                (o[i] = 'namedByFullFn'),
                (o['*'] = c.label ? 'namedFromLabel' : 'namedByPrime'),
                (a.namedByPrime = t),
                (a.namedByShortFn = n),
                (a.namedByFullFn = i),
                (a.namedFromLabel = c.label ? c.label : t),
                c.label
                  ? (c.style.nameOrigin = o[c.label] || 'namedFromLabel')
                  : ((c.label = t), (c.style.nameOrigin = 'namedByPrime'));
            }
            function t() {
              (a = {
                namedFromTemplate: '',
                noVisibleName: '',
                namedFromLabel: '*',
              }),
                (o = { ' ': 'noVisibleName', '*': 'namedFromLabel' });
            }
            var n,
              i = _e.nameClass,
              a = {},
              o = {};
            if (
              ((n = p && z(r) === i ? r : c), $('.wLabelRadios').toggle(!1), i)
            ) {
              switch (($('#' + i + 'Buttons').toggle(!0), i)) {
                case 'transImage':
                  e(),
                    _e.handleTap &&
                      n &&
                      z(n) === i &&
                      'namedFromLabel' !== n.style.nameOrigin &&
                      (c.style.nameOrigin = n.style.nameOrigin);
                  break;
                case 'measure':
                case 'param':
                  t();
              }
              LabelControls.init(
                i,
                me,
                WIDGETS.controlCallback,
                a,
                o,
                '#wLabelEditText',
                '#' + i + "Buttons input[type='radio']",
                '#wLabelShow'
              );
            } else LabelControls.terminate();
          }
          function n() {
            var e = d.val();
            e && _e.setFontSize(e), (e = u.val()), e && _e.setFont(e);
          }
          function i(e) {
            var t,
              n = !1;
            for (t = 0; t < u[0].length; t++)
              if (u[0][t].innerText === e) {
                (u[0].selectedIndex = t), (n = !0);
                break;
              }
            return n;
          }
          function a(e, t) {
            var n,
              i,
              a,
              o = $('#wLabelFont optgroup'),
              l = "<option value='" + e + "'>" + t + '</option>',
              s = o.filter('[label="Sans Serif"]'),
              c = o.filter('[label="Serif"]'),
              r = o.filter('[label="Mono-spaced"]'),
              d = o.filter('[label="Other"]'),
              p = !1;
            for (
              i = e.search(/sans-serif/i)
                ? s
                : e.search(/serif/i)
                ? c
                : e.search(/monospace/i)
                ? r
                : d.length
                ? d
                : u.append('<optgroup label="Other"></optgroup>'),
                a = $(i).find('option'),
                n = 0;
              n < a.length;
              n++
            )
              if (-1 === t.localeCompare(a[n].innerText)) {
                $(a[n]).before($(l)), (p = !0);
                break;
              }
            p || i.append(l);
          }
          function o() {
            var e = X(me),
              t = e['font-size'];
            if ((d.val(t), (u[0].selectedIndex = -1), (t = Z(me, !1)), !t))
              throw GSP.createError(
                'WIDGETS.copyGObjToStyles() found a gobj without a font family.'
              );
            i(t) || (a(e['font-family'], t), i(t));
          }
          function l(e, n) {
            var i;
            return (
              (i = e && n && e.hasLabel === n.hasLabel),
              (i =
                i &&
                (n.hasLabel ||
                  e.kind === n.kind ||
                  (e.isOfKind('Measure') && n.isOfKind('Measure')))),
              (i = i && !t(e.style.label, n.style.label)),
              (i = i && (_e.isTap || !n.hasLabel || !n.style.label.showLabel))
            );
          }
          function s() {
            var e,
              t = f.textMFS,
              n = t.match(/<T\'[^\'\r\n]+\'>/g),
              i = '';
            for (e = 0; e < n.length; e++)
              i && (i += ' '), (i += n[e].replace(/<T\'([^\'\r\n]+)\'>/, '$1'));
            return i;
          }
          var c,
            r,
            p,
            g,
            v = 'Tapped';
          return (
            (g = !1),
            'Caption' !== f.genus || f.label
              ? 'CompositeText' === f.genus && (g = !0)
              : (f.label = s()),
            $('#wLabelEditText').prop('disabled', g),
            $('#wLabelEditLabel').prop('disabled', g),
            f.hasLabel || f.style.nameOrigin
              ? $('#wShowLabelButton label').show()
              : $('#wShowLabelButton label').hide(),
            (c = f),
            (r = me),
            (p = l(r, c)),
            _e.clear(!1),
            me && me.setRenderState('none'),
            f.setRenderState('targetHighlit'),
            (this.prevGobj = me),
            (me = f),
            (_e.nameClass = z(me)),
            _e.cacheProperties(me),
            c.hasLabel &&
              !c.style.label.showLabel &&
              ((c.labelRenderBounds = Y(
                c.sQuery.sketch.renderRefCon.labelBounds[c.id]
              )),
              c.setLabelPosition(_e.touchPos, { x: 0, y: 0 })),
            R(me.label),
            p ? n() : o(),
            (('namedFromLabel' === c.style.nameOrigin &&
              c.label.match(/namedFromLabel/)) ||
              !c.label) &&
              (U(c), (v = 'Generated')),
            e(),
            v
          );
        }
        function a(e) {
          r.prop('disabled', !1), J(!0, e), r.prop('checked', !0);
        }
        function o() {
          var e = me.style.nameOrigin,
            t = me.isOfKind('Button'),
            n = 'measure' === _e.nameClass || 'param' === _e.nameClass,
            i = t || 'undefined' == typeof e,
            a = i || 'namedFromLabel' === e;
          t
            ? (r.prop('checked', a), r.prop('disabled', i))
            : n &&
              ($('#wLabelPane .radio-inline input').prop('checked', !1),
              $("#wLabelPane .radio-inline input[value='" + e + "']").prop(
                'checked',
                !0
              ),
              r.prop('checked', 'noVisibleName' !== e),
              r.prop('disabled', !1));
        }
        function l(e) {
          var t = e.match(/<VL<T\'.*\'>>/);
          return t || (t = e.match(/<T\'.*\'>/)), t ? !0 : !1;
        }
        var s,
          c = _e.inputElt,
          r = _e.showLabelElt,
          d = _e.sizeElt,
          u = _e.fontElt,
          p = GSP.GeometricPoint(n.position.x, n.position.y),
          f = Object.getPrototypeOf(_e).handleTap(e, n);
        if (
          ((_e.touchPos = p),
          (_e.isTap = !0),
          f.canEditLabel() || ('Caption' === f.genus && l(f.textMFS)))
        ) {
          if ((H(), f === me))
            return me.hasLabel && (J(), R(me.label)), void (_e.isTap = !1);
          _e.finalizeLabel(),
            (s = i()),
            me.hasLabel ? a(s) : o(),
            c.on('keyup', function(e) {
              if ((e.stopPropagation(), 13 === e.keyCode)) _e.deactivate();
              else if (27 === e.keyCode)
                (_e.cancelOnExit = !0), _e.deactivate();
              else {
                var t = c.val();
                t.length > 0 ? K(me, t) : me.isOfKind('Button') && R(' ');
              }
            }),
            (_e.isTap = !1);
        }
      }),
      (_e.defineControls = function() {
        this.inputElt ||
          ((this.inputElt = $('#wLabelEditText')),
          (this.showLabelElt = $('#wLabelShow')),
          (this.sizeElt = $('#wLabelFontSize')),
          (this.fontElt = $('#wLabelFont')));
      }),
      (_e.activate = function(e, t) {
        return Object.getPrototypeOf(this).activate(e, this, t)
          ? ((this.cancelOnExit = !1),
            (me = null),
            (this.prevGobj = null),
            this.defineControls(),
            $('#wLabelPane').css('display', 'none'),
            this.inputElt.on('click', function() {
              $(this).focus();
            }),
            this.clear(),
            !0)
          : !1;
      }),
      (_e.deactivate = function() {
        me &&
          (me.setRenderState('none'),
          this.cancelOnExit ? this.restoreLabel(me) : this.confirmLabel()),
          this.clear(),
          Object.getPrototypeOf(this).deactivate(this),
          $('#wLabelContent').css('display', 'none'),
          $('#wLabelPane').css('display', 'none'),
          $('#wLabelPrompt').css('display', 'none'),
          (this.cancelOnExit = !1);
      }),
      (_e.confirmLabel = function() {
        this.finalizeLabel(), this.clear();
      }),
      (_e.setFontSize = function(e) {
        var t = X(me);
        (e = +e),
          t['font-size'] !== e && ((t['font-size'] = e), V(me, 'Set size for'));
      }),
      (_e.setFont = function(e) {
        var t = X(me),
          n = t['font-family'];
        n !== e && ((t['font-family'] = e), V(me, 'Set font for'));
      }),
      (_e.postProcessSketch = function(e) {
        _e.clear(),
          $('#wLabelPane').css('display', 'none'),
          $('#wLabelPrompt').css('display', 'block'),
          (me = null),
          Object.getPrototypeOf(_e).postProcessSketch(this, e);
      });
    var De, Ge, Ie, Be;
    return (
      (je.setTraceRenderState = function(e) {
        $.each(Be, function() {
          this.setRenderState(e ? 'unmatchedGiven' : 'none');
        });
      }),
      (je.setState = function(e, t, i, a) {
        var o = n().preferences,
          l = { action: i };
        return (
          void 0 === a ? (a = e.checked) : (e.checked = a),
          t && (o[t] = a),
          i && ((l[i] = a), this.event({}, l)),
          $('#wTracePrompt').css('display', 'none'),
          a
        );
      }),
      (je.setGlowing = function(e) {
        void 0 === e
          ? (e = this.setState(Ie, void 0, 'glowing', void 0))
          : this.setState(Ie, void 0, 'glowing', e),
          (this.glowing = e),
          e ? (oe(), ie()) : (le(), ae('force'));
      }),
      (je.setEnabling = function(e) {
        this.setState(De, 'tracesEnabled', 'enabled', e);
      }),
      (je.setFading = function(e) {
        this.setState(Ge, 'fadeTraces', 'fading', e), e && n().startFadeJob(!0);
      }),
      (je.activate = function(e, t) {
        function i() {
          var e = {};
          return (
            n()
              .sQuery('*')
              .each(function() {
                this.style.traced && !this.style.hidden && (e[this.id] = this);
              }),
            e
          );
        }
        return (
          (De = $('#wTraceEnabled')[0]),
          (Ge = $('#wTraceFading')[0]),
          (Ie = $('#wTracesGlowing')[0]),
          (Be = i()),
          Object.getPrototypeOf(this).activate(e, this, t)
            ? ((De.checked = n().preferences.tracesEnabled),
              (Ge.checked = n().preferences.fadeTraces),
              this.setGlowing(Ie.checked),
              (this.cancelOnExit = !1),
              $('#wTracePane').css('display', 'block'),
              (je.autoEnabled = !1),
              !0)
            : !1
        );
      }),
      (je.deactivate = function() {
        Ie.checked && ae('force'),
          this.setGlowing(!1),
          Object.getPrototypeOf(this).deactivate(this),
          $('#wTracePane').css('display', 'none'),
          (this.cancelOnExit = !1);
      }),
      (je.signalChangedTraceState = function(e) {
        function t() {
          var e = n().canvasNode.css('backgroundColor'),
            t = e.match(/rgba\(.*,.*,.*,\s*(.*)\)/);
          return t && t[1] && '0' === t[1] ? 'white' : e;
        }
        var i = e.state.renderState,
          a = e.style.color;
        e.style.traced
          ? (e.setRenderState('targetHighlit'),
            setTimeout(function() {
              e.setRenderState(i);
            }, 500))
          : e.isOfKind('Point')
          ? (e.hide(),
            setTimeout(function() {
              e.show();
            }, 500))
          : ((e.style.color = t()),
            e.style.width && (e.style.width += 1),
            e.invalidateAppearance(),
            setTimeout(function() {
              (e.style.color = a),
                e.style.width && (e.style.width -= 1),
                e.invalidateAppearance();
            }, 500));
      }),
      (je.toggleGobjTracing = function(e, t) {
        var n = e.style;
        (n.traced = void 0 === t ? !n.traced : t),
          n.traced ? (Be[e.id] = e) : delete Be[e.id],
          this.event({}, { action: 'changed', gobjId: e.id, traced: n.traced }),
          n.traced
            ? (je.autoEnabled || (je.setEnabling(!0), (je.autoEnabled = !0)),
              Ie.checked && e.setRenderState('unmatchedGiven'))
            : e.setRenderState('none'),
          $('#wTracePrompt').css('display', 'none'),
          Ie.checked || je.signalChangedTraceState(e);
      }),
      (je.handleTap = function(e, t) {
        var n = Object.getPrototypeOf(je).handleTap(e, t);
        te(n) && n && this.toggleGobjTracing(n);
      }),
      (We.deleteWithProgeny = function(e, t) {
        var i,
          a = n(),
          o = a.document.getRecentChangesDelta();
        a.gobjList.removeGObjects(t, a),
          (i = a.document.pushConfirmedSketchOpDelta(o)),
          a.document.changedUIMode(),
          this.event(
            {},
            {
              action: 'deleteConfirm',
              gobj: this.gobj.id,
              deletedIds: Object.keys(t),
              preDelta: o,
              delta: i,
            }
          );
      }),
      (We.activate = function(e, t) {
        return Object.getPrototypeOf(this).activate(e, this, t)
          ? ((this.cancelOnExit = !1), !0)
          : !1;
      }),
      (We.deactivate = function() {
        Object.getPrototypeOf(this).deactivate(this),
          $('#wDeletePrompt').css('display', 'none'),
          (this.cancelOnExit = !1),
          delete We.gobj,
          delete We.progenyList;
      }),
      (We.handleTap = function(e, t) {
        var n = Object.getPrototypeOf(We).handleTap(e, t),
          i = $('#delete-confirm-modal'),
          a = i.find('.util-popup-content');
        n &&
          ((We.gobj = n),
          (We.progenyList = n.sQuery.sketch.gobjList.compileDescendants(n)),
          se(We.progenyList, 'targetHighlit'),
          i.css('display', 'block'),
          a.tinyDraggable({ exclude: '.dragExclude' }),
          $('#deleteCancel').focus());
      }),
      (We.deleteConfirm = function() {
        $('#delete-confirm-modal').css('display', 'none'),
          We.deleteWithProgeny(We.gobj, We.progenyList);
      }),
      (We.deleteCancel = function() {
        $('#delete-confirm-modal').css('display', 'none'),
          se(We.progenyList, 'none');
      }),
      {
        initWidget: ue,
        deepEquals: function(e, n) {
          return t(e, n);
        },
        showWidgets: function(e, t) {
          if (!fe && e)
            throw GSP.createError('showWidgets called before loading $widget.');
          return e
            ? void (
                (t && (d(t), ve !== t)) ||
                ((ve || !e) &&
                  (e
                    ? (l(), we && (we.activate(n(), we), (we = null)))
                    : (ye && ((we = ye), ye.deactivate()), s())))
              )
            : void s();
        },
        relatedSketchNode: function(e) {
          for (
            var t = $(e), n = t.filter('.sketch_canvas');
            t.length && !n.length;

          )
            (n = t.prevAll('.sketch_canvas')), (t = t.parent());
          if (!n.length)
            throw GSP.createError(
              "relatedSketchNode() couldn't find the target sketch_canvas"
            );
          return n[0];
        },
        toggleWidgets: function(e) {
          var t = 'none' === fe.css('display'),
            n = WIDGETS.relatedSketchNode(e);
          if (!n)
            throw GSP.createError(
              "toggleWidgets called for an element that's neither a sketch_canvas nor a widget_button"
            );
          return n !== ve && (t = !0), WIDGETS.showWidgets(t, n), t;
        },
        confirmModality: function() {
          ye && ((ye.cancelOnExit = !1), ye.deactivate());
        },
        cancelModality: function() {
          ye && ((ye.cancelOnExit = !0), ye.deactivate());
        },
        toggleStyleModality: function() {
          ye === $e ? $e.deactivate(this) : $e.activate(n());
        },
        toggleVisibilityModality: function() {
          ye === Oe
            ? Oe.deactivate(Oe)
            : ve && be.data('document') && Oe.activate(n());
        },
        toggleLabelModality: function() {
          ye === _e
            ? _e.deactivate(_e)
            : ve && be.data('document') && _e.activate(n());
        },
        toggleObjectModality: function() {
          ye === We
            ? We.deactivate(We)
            : ve && be.data('document') && We.activate(n());
        },
        toggleTraceModality: function() {
          ye === je
            ? je.deactivate(je)
            : ve && be.data('document') && je.activate(n());
        },
        setTraceEnabling: function(e) {
          je.setEnabling(e);
        },
        setTraceFading: function(e) {
          je.setFading(e);
        },
        setTraceGlowing: function(e) {
          je.setGlowing(e);
        },
        clearTraces: function() {
          n().clearTraces(), $('#wTracePrompt').css('display', 'none');
        },
        toggleGobjTracing: function(e, t) {
          je.toggleGobjTracing(e, t);
        },
        pointCheckClicked: function() {
          j(0 > ke ? $e.defaultPointStyle : -1);
        },
        pointGridClicked: function(e) {
          var t = p();
          j(Math.floor(e.offsetY / (20 * t)));
        },
        lineCheckClicked: function() {
          0 > Te && 0 > Pe
            ? _($e.defaultLineThickness, $e.defaultLineStyle)
            : _(-1, -1);
        },
        lineGridClicked: function(e) {
          var t = p();
          _(Math.floor(e.offsetY / (20 * t)), Math.floor(e.offsetX / (51 * t)));
        },
        colorCheckClicked: function() {
          var e = g($e.objectColorBox);
          e || $e.textColorBox.checked
            ? 0 > Ce && W($e.defaultColor.column, $e.defaultColor.row)
            : W(-1, 0);
        },
        labelCheckClicked: function() {
          var e = g($e.textColorBox);
          e || $e.objectColorBox.checked
            ? 0 > Ce && W($e.defaultColor.column, $e.defaultColor.row)
            : W(-1, 0);
        },
        labelSetFontSize: function(e) {
          me && _e.setFontSize(+e);
        },
        labelSetFont: function(e) {
          me && _e.setFont(e);
        },
        colorGridClicked: function(e) {
          var t = p(),
            n = e.pageX - $('#widget_colorGrid').offset().left,
            i = e.pageY - $('#widget_colorGrid').offset().top,
            a = Math.min(8, Math.floor(n / (27.2 * t))),
            o = Math.floor(i / (27 * t));
          W(a, o);
        },
        labelChanged: function(e, t) {
          t || (t = me), LabelControls.labelChanged(e) || K(t, e);
        },
        controlCallback: function(e, t) {
          return (e = K(me, e, t));
        },
        labelToggled: function() {
          J(_e.showLabelElt.prop('checked'));
        },
        invalidateLabel: function(e, t) {
          V(e, t);
        },
        deleteWithProgeny: function(e, t) {
          var i = n().gobjList.gobjects,
            a = i[e],
            o = {};
          t.forEach(function(e) {
            o[e] = i[e];
          }),
            We.deleteWithProgeny(a, o);
        },
        deleteConfirm: function() {
          We.deleteConfirm(this);
        },
        deleteCancel: function() {
          We.deleteCancel(this);
        },
        setWidgetsPrefs: function(e) {
          PREF.setWebPagePrefs(e);
        },
        getScriptPath: function() {
          return pe;
        },
        resizeSketchFrame: function(e) {
          y(e);
        },
      }
    );
  })(),
  LabelControls = (function() {
    function e(e, t) {
      var n = { namedFromTemplate: i, namedFromLabel: a, noVisibleName: o },
        r = {
          namedByPrime: l,
          namedByShortFn: s,
          namedByFullFn: c,
          namedFromLabel: a,
          noVisibleName: o,
        };
      switch (e) {
        case 'measure':
        case 'param':
          return n[t];
        case 'transImage':
          return r[t];
      }
    }
    function t(t, n, i, a, o, l, s, c) {
      (this.mode = t),
        (this.oldText = n.label),
        (this.oldOrigin = n.style.nameOrigin),
        (this.lastOrigin = ''),
        (this.labelText = n.label),
        $(l).prop('value', n.label),
        (this.callback = i),
        (this.textRule = a),
        (this.originRule = o),
        (this.radioSelector = s),
        (this.inputSelector = l),
        (this.showSelector = c),
        (this.tappedGobj = n),
        (this.radioPressed = function(t) {
          var n,
            i,
            a = this.textRule[t],
            o = this.tappedGobj;
          'namedFromLabel' === t && '' === a && (a = o.label),
            (t !== o.style.nameOrigin || a !== o.label) &&
              ((n = e(this.mode, t)), (this.state = new n(this))),
            'namedFromLabel' === t &&
              ((i = $(this.inputSelector)[0]),
              i.focus(),
              i.setSelectionRange(0, i.value.length));
        }),
        (this.originFromText = function(e) {
          var t;
          return (
            '' === e
              ? (t = 'noVisibleName')
              : ((t = this.originRule[e]),
                t ||
                  (t =
                    'transImage' === this.mode
                      ? 'namedFromLabel'
                      : this.originRule['*'])),
            t
          );
        }),
        (this.labelChanged = function(t, n) {
          var i = e(this.mode, n);
          (this.labelText = t),
            this.state instanceof i
              ? this.callback(t, n)
              : (this.state = new i(this));
        }),
        (this.state = null);
    }
    function n(e) {
      (this.nameOrigin = e),
        (this.init = function(t, n, i) {
          var a,
            o = n,
            l = 'noVisibleName' === e && 'transImage' === t.mode;
          (this.machine = t),
            e !== t.lastOrigin && (o = t.callback(n, e)),
            '' !== n && $(t.inputSelector).val(o),
            (a = $(this.machine.radioSelector + '[value=' + e + ']')),
            a.prop('checked') || a.prop('checked', !0),
            l
              ? $(t.radioSelector).prop('checked', !1)
              : o !== n &&
                ((this.machine.labelText = o),
                delete this.machine.originRule[n],
                (this.machine.originRule[o] = e),
                (this.machine.textRule[e] = o)),
            $(t.showSelector).prop('checked', i),
            (t.lastOrigin = e);
        });
    }
    function i(e) {
      this.init(e, '', !0);
    }
    function a(e) {
      this.init(e, e.labelText, !0);
    }
    function o(e) {
      this.init(e, '', !1), WIDGETS.labelToggled();
    }
    function l(e) {
      this.init(e, e.textRule.namedByPrime, !0);
    }
    function s(e) {
      this.init(e, e.textRule.namedByShortFn, !0);
    }
    function c(e) {
      this.init(e, e.textRule.namedByFullFn, !0);
    }
    var r;
    return (
      (i.prototype = new n('namedFromTemplate')),
      (i.prototype.constructor = i),
      (a.prototype = new n('namedFromLabel')),
      (a.prototype.constructor = a),
      (o.prototype = new n('noVisibleName')),
      (o.prototype.constructor = o),
      (l.prototype = new n('namedByPrime')),
      (l.prototype.constructor = l),
      (s.prototype = new n('namedByShortFn')),
      (s.prototype.constructor = s),
      (c.prototype = new n('namedByFullFn')),
      (c.prototype.constructor = c),
      {
        init: function(n, i, a, o, l, s, c, d) {
          var u = e(n, i.style.nameOrigin);
          (r = new t(n, i, a, o, l, s, c, d)),
            (r.state = new u(r)),
            $('.wLabelRadios label').click(function(e) {
              LabelControls.transition(e);
            });
        },
        terminate: function() {
          r && (r = null);
        },
        transition: function(e) {
          var t = e.target.value || e.target.children[0].value;
          t && r.radioPressed(t);
        },
        labelChanged: function(e) {
          return r ? (r.labelChanged(e, this.originFromText(e)), !0) : !1;
        },
        originFromText: function(e) {
          return r ? r.originFromText(e) : null;
        },
      }
    );
  })(),
  PAGENUM = (function() {
    function e(e, t) {
      return $(e)
        .parent()
        .find(t);
    }
    function t(e) {
      return $(e).data('document');
    }
    function n(e) {
      var t = e.tools;
      t &&
        t.forEach(function(t) {
          var n = t.$element,
            i = n[0],
            a = t.metadata.name.toLowerCase().replace(/\s+/g, ''),
            o = PREF.getPref(e, a, 'tool'),
            l = i.className;
          (l = l
            .replace(/\bpage_toggle\b/, ' ')
            .replace(/\bp_\d+\b/g, ' ')
            .trim()),
            o &&
              'all' !== o[0] &&
              ((l += ' page_toggle'),
              'none' !== o[0] &&
                o.forEach(function(e) {
                  l += ' p_' + e;
                })),
            (i.className = l.trim()),
            n.toggle('all' === o[0] || o.includes(e.focusPage.metadata.id));
        });
    }
    function i(t) {
      var n,
        i,
        a,
        o = t.canvasNode[0],
        l = e(o, '.page_buttons'),
        s = e(o, '.button_area'),
        d = PREF.getPref(t, 'pagecontrol'),
        u = PREF.getPref(t, 'resetbutton'),
        p = PREF.getPref(t, 'wsplogo');
      if (1 === l.length && d) {
        if (
          ((n =
            '<span class="page_btn page_prevBtn">&nbsp;</span><div style="display:inline-block; position:relative;"><span class="page_num"></span></div><span class="page_btn page_nextBtn">&nbsp;</span></span>'),
          l.html(n),
          t.docSpec.pages.length > 1 &&
            (l.addClass('page_buttonsActive'), !s.length))
        ) {
          i = '<div class="button_area"></div>';
          var f = l.detach();
          (s = $(i)), (s = s.append(f)), $(o).after(s);
        }
        l.find('.page_num').on('click', { node: o }, function(e) {
          return r(e.data.node), !1;
        }),
          l.find('.page_prevBtn').on('click', { node: o }, function(e) {
            return c(e.data.node, -1, !0), !1;
          }),
          l.find('.page_nextBtn').on('click', { node: o }, function(e) {
            return c(e.data.node, 1, !0), !1;
          }),
          c(o, +t.metadata['start-page']);
      }
      1 === s.length &&
        (u.length &&
          'none' !== u[0] &&
          0 === e(o, '.reset_button').length &&
          ((n = '<button class="reset_button'),
          'all' !== u[0] &&
            ((n += ' page_toggle'),
            u.forEach(function(e) {
              n += ' p_' + e;
            })),
          (n += '" onclick="PAGENUM.resetPage(this);">Reset</button>'),
          s.append(n)),
        p &&
          0 === e(o, '.wsp_logo').length &&
          ((n = '<div class="wsp_logo"></div>'),
          (a = s.find('.util-menu-btn')),
          a.length > 0 ? a.after(n) : s.prepend(n)));
    }
    function a(e) {
      var t = e.focusPage.metadata.id,
        n = $(e.canvasNode)
          .parent()
          .find('.page_popupNum');
      n.length > 0 &&
        ($(n).css('background-color', '#fff'),
        $(n[t - 1]).css('background-color', '#ccc'));
    }
    function o(e, t, n) {
      var i = $(t)
        .closest('.sketch_container')
        .find('.page_toggle');
      i.length && (i.hide(), i.filter('.p_' + n).show());
      var a = 0 === $(t, '.wsp-tools-inner').height();
      e.getAuthorPreference('UndoRedoInButtonBar') &&
        a &&
        ($(t, '.wsp-ok-cancel-container').hide(), e.attachUndoRedo());
    }
    function l(e, t) {
      var n = e.focusPage,
        i = n.metadata.id,
        l = e.docSpec.pages.length,
        s = $(e.canvasNode)
          .parent()
          .find('.page_buttons');
      u && n.restoreTraces(),
        s &&
          (s.find('.page_num').html('&nbsp;' + i + '&nbsp;'),
          s.find('.page_nextBtn').css('opacity', l > i ? '1' : '0.4'),
          s.find('.page_prevBtn').css('opacity', i > 1 ? '1' : '0.4'),
          a(e)),
        o(e, t, i);
    }
    function s() {
      var e = $('.sketch_canvas');
      e.on('LoadDocument.WSP', function(e, t) {
        i(t.document), n(t.document);
      }),
        e.on('DidChangeCurrentPage.WSP', function(e, t) {
          l(t.document, e.target);
        });
    }
    function c(e, n, i) {
      var a = t(e),
        o = a.focusPage,
        l = +a.focusPage.metadata.id;
      i && (n += l),
        n > 0 &&
          n <= a.docSpec.pages.length &&
          n !== l &&
          (u && !o.preferences.fadeTraces && o.saveTraces(), a.switchPage(n));
    }
    function r(n) {
      function i(e) {
        return '<span class="page_popupNum">&nbsp;' + e + '&nbsp;</span>';
      }
      var o = e(n, '.page_buttons');
      if (o.find('.page_popup').length > 0) return void d(n);
      for (
        var l = t(n), s = l.docSpec.pages.length, r = i(1), u = 2;
        s >= u;
        u += 1
      )
        r += '<br>' + i(u);
      var p = $.parseHTML(
        '<div class="page_popup" style="line-height:1.1rem;">' + r + '</div>'
      );
      o.find('.page_num').after(p[0]);
      var f = $(p).outerHeight() + 1;
      $(p).css({ top: -f + 'px' }),
        a(l),
        o.find('.page_popupNum').on('mouseover', { node: n }, function(e) {
          c(e.data.node, this.innerText.trim());
        }),
        o.find('.page_popupNum').on('click', { node: n }, function(e) {
          return c(e.data.node, this.innerText.trim()), d(e.data.node), !1;
        }),
        $(window).one('click', { node: n }, function(e) {
          return $(e.target).hasClass('page_num')
            ? void 0
            : (d(e.data.node), !1);
        }),
        $(window).off('keydown'),
        $(window).on('keydown', { node: n }, function(e) {
          var t = e.which;
          return 13 === t
            ? (d(e.data.node), !1)
            : t >= 37 && 40 >= t
            ? (38 >= t ? c(e.data.node, -1, !0) : c(e.data.node, 1, !0), !1)
            : t > 48 && 58 > t
            ? (c(e.data.node, t - 48), !1)
            : void 0;
        });
    }
    function d(t) {
      var n = e(t, '.page_buttons');
      n.find('.page_popupNum').off('mouseover'),
        n.find('.page_popupNum').off('click'),
        n.find('.page_popup').remove(),
        $(window).off('keydown');
    }
    var u = !0;
    return {
      initPageControls: function() {
        s();
      },
      resetPage: function(e) {
        var n = WIDGETS.relatedSketchNode(e);
        t(n).resetActivePage();
      },
      gotoPage: function(e, n) {
        var i = WIDGETS.relatedSketchNode(e);
        t(i).switchPage(n);
      },
      setToolEnabling: function(e) {
        n(e);
      },
    };
  })(),
  UTILMENU = (function() {
    function e() {
      function e(e, t) {
        return (
          '<div class="util-menu-item util-menu util-length" data-unit="' +
          t +
          '">  ' +
          e +
          '</div>'
        );
      }
      function t(e, t) {
        return (
          '<div class="util-menu-item util-menu util-angle" data-unit="' +
          t +
          '">  ' +
          e +
          '</div>'
        );
      }
      var a = WIDGETS.getScriptPath(),
        o = $(this),
        l = '<div class="util-menu-btn util-menu">',
        s = o.parent().find('.util-menu-btn');
      s.length &&
        ((l = '<div class="util-menu-btn util-menu"> '),
        (l +=
          '<img class = "util-menu" src="' +
          a +
          'utility-icon.png" onclick="UTILMENU.menuBtnClicked(this);" />'),
        (l += '<div class="util-menu-content util-menu">'),
        (l += '<div class="util-unit-items util-menu">'),
        (l += e('cm', 'cm') + e('inches', 'in.') + e('pixels', 'pix')),
        (l += '<hr>'),
        (l +=
          t('degrees(+/-)', 'signed deg') +
          t('degrees(+)', 'deg') +
          t('radians', 'rad')),
        (l += '</div> <div class="util-file-items">'),
        (l += '<hr>'),
        (l +=
          '<div class="util-menu-item util-menu util-download" onclick="UTILMENU.download(event);">Download...</div>'),
        (l +=
          '<div class="util-menu-item util-menu util-upload" onclick="UTILMENU.upload(event);">Upload...</div>'),
        (l += '</div>'),
        (l += '</div>'),
        (l += '</div>'),
        s.replaceWith(l),
        o
          .parent()
          .find('.util-length')
          .click(function() {
            PREF.setUnitPref(o, 'length', $(event.target).data('unit')),
              n(event.target);
          }),
        o
          .parent()
          .find('.util-angle')
          .click(function() {
            PREF.setUnitPref(o, 'angle', $(event.target).data('unit')),
              n(event.target);
          }),
        o
          .parent()
          .find('.util-menu-content')
          .mouseleave(i));
    }
    function t(t, n) {
      var i,
        a,
        o,
        l,
        s = n.document,
        c = $(s.canvasNode)
          .parent()
          .find('.util-menu-btn');
      c.length &&
        ((i = c.find('.util-file-items')),
        i.length || (e.call(s.canvasNode), (i = c.find('.util-file-items'))),
        (o = PREF.getPref(s, 'upload', 'util')),
        (a = PREF.getPref(s, 'download', 'util')),
        (l = o || a),
        c.find('util-download').show(a),
        c.find('util-upload').show(o),
        c.find('util-file-items').show(l));
    }
    function n(e) {
      function t(e) {
        switch (e) {
          case 'signed deg':
            return 'degrees(+/-)';
          case 'deg':
            return 'degrees(+)';
          case 'rad':
            return 'radians';
        }
      }
      function n(e) {
        switch (e) {
          case 'cm':
            return 'cm';
          case 'in.':
            return 'inches';
          case 'pix':
            return 'pixels';
        }
      }
      function i() {
        var e = this.innerText.substring(2);
        (e = e === s ? '&check; ' + e : r + e), (this.innerHTML = e);
      }
      var a,
        o,
        l,
        s,
        c,
        r = '&nbsp; ';
      (e = $(e)),
        (e = e.closest('.util-menu-btn')),
        (a = e.parents('.sketch_container').find('.sketch_canvas')),
        (o = a.data('document')),
        (l = o.focusPage.preferences.units),
        (c = e.find('.util-length')),
        (s = n(l.length)),
        c.each(i),
        (c = e.find('.util-angle')),
        (s = t(l.angle)),
        c.each(i);
    }
    function i() {
      $('.util-menu-content').hide();
    }
    function a(e, t) {
      var n,
        i,
        a,
        o,
        l,
        s = e.pageData;
      if ($('#util-fname')[0].validity.valid) {
        (n = '.js' === t.slice(-3) || '-json' === t.slice(-5)),
          n
            ? ((t = t.split(/.js$/)[0].split(/-json$/)[0]),
              (i = GSP.normalizeSketchName(t)),
              (t = i + '-json.js'))
            : '.json' !== t.slice(-5) && (t += '.json');
        var c = $('#downloadLink')[0];
        $.each(e.docSpec.pages, function(e, t) {
          var n = t.metadata.id;
          s[n].session.traceData && (t.traceData = s[n].session.traceData);
        }),
          (a = JSONcanonical.stringify(e.getCurrentSpecObject(), null, 2)),
          n && (a = 'var ' + i + ' = ' + a + ';'),
          (o = new Blob([a], { type: 'text/plain' })),
          (l = URL.createObjectURL(o)),
          (c.href = l),
          (c.download = t),
          c.click(),
          e.event('DownloadDocument', { document: e }, { fileName: t }),
          r(e),
          UTILMENU.closeModal('download-modal', 'save');
      }
    }
    function o() {
      var e = $('#download-modal'),
        t = $('#util-fname');
      e.css('display', 'block'),
        e
          .find('.util-popup-content')
          .tinyDraggable({ exclude: '.dragExclude' }),
        t.select(),
        UTILMENU.checkFName(t[0].validity.valid);
    }
    function l() {
      $('#upload-modal').data('sketchNode', p),
        $('#file-name-input').attr(
          'onchange',
          'UTILMENU.loadSketch(this.files[0]);'
        );
    }
    function s() {
      function e() {
        a($(p).data('document'), $('#util-fname')[0].value);
      }
      var t = $(p).data('fileName') + $(p).data('fileExt');
      $('#download-modal').data('sketchNode', p),
        t && ($('#util-fname')[0].value = t);
      var n = $('#downloadOK');
      n.focus(),
        n.on('click', function() {
          e();
        }),
        $('#util-fname').on('keyup', function(t) {
          var n = $('#util-fname')[0].validity.valid;
          27 === t.keyCode
            ? UTILMENU.closeModal('download-modal', 'cancel')
            : 13 === t.keyCode && n && e();
        });
    }
    function c(e) {
      var t,
        n = $('#upload-modal');
      (p = e),
        (t =
          d(e) &&
          PREF.shouldEnableForCurrentPage(
            'util',
            'download',
            $(e).data('document').focusPage
          )),
        l(),
        t
          ? (s(),
            n.css('display', 'block'),
            n
              .find('.util-popup-content')
              .tinyDraggable({ exclude: '.dragExclude' }),
            $('#downloadBeforeUpload').focus(),
            n.on('keyup', function(e) {
              27 === e.keyCode && UTILMENU.closeModal('upload-modal', 'cancel');
            }))
          : $('#file-name-input').click();
    }
    function r(e) {
      var t = e.canvasNode[0].id,
        n = b64_md5(JSON.stringify(e.getCurrentSpecObject()));
      $('#' + t).data('prevChecksum', n);
    }
    function d(e) {
      var t = $(e).data('document'),
        n = t.getCurrentSpecObject(),
        i = b64_md5(JSON.stringify(n)),
        a = $(e).data('prevChecksum');
      return i !== a;
    }
    function u(e) {
      function t(e) {
        return (
          e &&
            e.includes('Times') &&
            e.includes('sans-serif') &&
            (e = e.replace('sans-serif', 'serif')),
          e
        );
      }
      function n(e) {
        var n;
        for (n = 0; n < e.length; ++n) e[n] = t(e[n]);
      }
      function i(e) {
        $.each(e, function(e, n) {
          var i = n['font-family'];
          i
            ? (n['font-family'] = t(i))
            : n.label &&
              ((i = n.label['font-family']),
              i && (n.label['font-family'] = t(i)));
        });
      }
      function a(e) {
        n(e.resources.fontList),
          e.pageData
            ? $.each(e.pageData, function(e, t) {
                i(t.spec.preferences.text.textTypes);
              })
            : $.each(e.pages, function(e, t) {
                i(t.preferences.text.textTypes);
              });
      }
      var o = ['"Times New Roman", serif', '"Arial", sans-serif'];
      e.resources
        ? e.resources.fontList
          ? a(e)
          : (e.resources.fontList = o)
        : (e.resources = { fontList: o }),
        e.docSpec.resources
          ? e.docSpec.resources.fontList
            ? a(e.docSpec)
            : (e.docSpec.resources.fontList = o)
          : (e.docSpec.resources = { fontList: o }),
        i(e.focusPage.preferences.text.textTypes),
        r(e);
    }
    var p;
    return {
      checkFName: function(e) {
        $('#downloadOK').prop('disabled', !e.valid);
      },
      closeModal: function(e, t) {
        if (($('#' + e).css('display', 'none'), 'download-modal' === e))
          $('#util-fname').off('keyup'), $('#downloadOK').off('click');
        else if ('upload-modal' === e)
          switch (t) {
            case 'save':
              o($(this).parents('.util-menu-btn'));
              break;
            case 'dont-save':
              $('#file-name-input').click();
          }
      },
      download: function(e) {
        i(),
          (p = WIDGETS.relatedSketchNode(e.target)),
          $('#download-modal').data('callSave') &&
            $('#download-modal').removeData('callSave'),
          s(p),
          o();
      },
      loadSketch: function(e) {
        var t, n, i, a;
        if (e) {
          if (
            ((t = new FileReader()),
            (n = $(p)),
            (i = e.name),
            (a = i.endsWith('-json.js')))
          )
            i = i.replace(/\.js$/, '');
          else if (!i.endsWith('.json')) return;
          (i = i.replace(/[\.\-]json/, '')),
            (t.onload = function(e) {
              var t,
                o = e.target.result;
              a &&
                ((t = o.indexOf('{')),
                (o = o.substring(t)),
                (t = o.match(/}\s*;\s*$/).index),
                (o = o.substring(0, t + 1))),
                n.data('sourceDocument', o),
                n.data('fileName', i),
                n.data('fileExt', a ? '-json.js' : '.json'),
                n.WSP('loadSketch'),
                n.removeData('sourceDocument');
            }),
            t.readAsText(e);
        }
      },
      upload: function(e) {
        i(), c(WIDGETS.relatedSketchNode(e.target));
      },
      menuBtnClicked: function(e) {
        var t = $(e.parentNode),
          i = t.find('.util-menu-content');
        n(t), i.show();
      },
      initUtils: function() {
        var e = $('.sketch_canvas');
        e.on('LoadDocument.WSP', function(e, n) {
          u(n.document), t(e, n);
        });
      },
    };
  })();
$(function() {
  WIDGETS.initWidget(), PAGENUM.initPageControls(), UTILMENU.initUtils();
});
