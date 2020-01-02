
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        return definition[2] && fn
            ? $$scope.dirty | definition[2](fn(dirty))
            : $$scope.dirty;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let stylesheet;
    let active = 0;
    let current_rules = {};
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        if (!current_rules[name]) {
            if (!stylesheet) {
                const style = element('style');
                document.head.appendChild(style);
                stylesheet = style.sheet;
            }
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        node.style.animation = (node.style.animation || '')
            .split(', ')
            .filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        )
            .join(', ');
        if (name && !--active)
            clear_rules();
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            current_rules = {};
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            $$.fragment && $$.fragment.p($$.ctx, $$.dirty);
            $$.dirty = [-1];
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const blankProgram = {
      selectedStations: ['s1'],
      dailyStart: 0,
      dailyStop: 43200000,
      dateStart: new Date(new Date().toLocaleDateString()).getTime(),
      dateInterval: 86400000,
      timerOn: 0,
      timerOff: 0,
      timerDuration: 0,
      timerInterval: 0,
      type: 'dow',
      dow: [],
    };

    const initialStationNames = {
      s1: 's1',
      s2: 's2',
      s3: 's3',
      s4: 's4',
      s5: 's5',
      s6: 's6',
      s7: 's7',
      s8: 's8',
    };

    const selectedStations = writable(blankProgram.selectedStations);
    const dailyStart = writable(blankProgram.dailyStart);
    const dailyStop = writable(blankProgram.dailyStop);
    const dateStart = writable(blankProgram.dateStart);
    const dateInterval = writable(blankProgram.dateInterval);
    const timerDuration = writable(blankProgram.timerDuration);
    const timerInterval = writable(blankProgram.timerInterval);
    const type = writable(blankProgram.type);
    const dow = writable(blankProgram.dow);
    const programIndex = writable(0);
    const stationNames = writable(
      Object.keys(initialStationNames)
        .sort()
        .map(v => initialStationNames[v])
    );

    function _programs() {
      const { subscribe, set, update } = writable([{ ...blankProgram }]);

      return {
        subscribe,
        set,
        setPrograms: data =>
          update(p => {
            p = data;
            return p;
          }),
      };
    }

    const programs = _programs();

    /* src\Components\Button.svelte generated by Svelte v3.16.0 */

    const file = "src\\Components\\Button.svelte";

    function create_fragment(ctx) {
    	let button;
    	let t;
    	let button_class_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(/*name*/ ctx[0]);
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*buttonType*/ ctx[2]) + " svelte-56ytor"));
    			attr_dev(button, "data-value", /*data*/ ctx[3]);
    			toggle_class(button, "checked", /*checked*/ ctx[4]);
    			add_location(button, file, 219, 0, 5683);
    			dispose = listen_dev(button, "click", /*click*/ ctx[1], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t, /*name*/ ctx[0]);

    			if (dirty & /*buttonType*/ 4 && button_class_value !== (button_class_value = "" + (null_to_empty(/*buttonType*/ ctx[2]) + " svelte-56ytor"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*data*/ 8) {
    				attr_dev(button, "data-value", /*data*/ ctx[3]);
    			}

    			if (dirty & /*buttonType, checked*/ 20) {
    				toggle_class(button, "checked", /*checked*/ ctx[4]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { name = "button" } = $$props;
    	let { click = undefined } = $$props;
    	let { buttonType = undefined } = $$props;
    	let { data = undefined } = $$props;
    	let { checked = false } = $$props;
    	const writable_props = ["name", "click", "buttonType", "data", "checked"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("click" in $$props) $$invalidate(1, click = $$props.click);
    		if ("buttonType" in $$props) $$invalidate(2, buttonType = $$props.buttonType);
    		if ("data" in $$props) $$invalidate(3, data = $$props.data);
    		if ("checked" in $$props) $$invalidate(4, checked = $$props.checked);
    	};

    	$$self.$capture_state = () => {
    		return { name, click, buttonType, data, checked };
    	};

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("click" in $$props) $$invalidate(1, click = $$props.click);
    		if ("buttonType" in $$props) $$invalidate(2, buttonType = $$props.buttonType);
    		if ("data" in $$props) $$invalidate(3, data = $$props.data);
    		if ("checked" in $$props) $$invalidate(4, checked = $$props.checked);
    	};

    	return [name, click, buttonType, data, checked];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			name: 0,
    			click: 1,
    			buttonType: 2,
    			data: 3,
    			checked: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get name() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get click() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set click(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get buttonType() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set buttonType(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\SelectStation.svelte generated by Svelte v3.16.0 */
    const file$1 = "src\\Components\\SelectStation.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (26:2) {#each $stationNames as stationName, i}
    function create_each_block(ctx) {
    	let current;

    	function func(...args) {
    		return /*func*/ ctx[3](/*i*/ ctx[6], ...args);
    	}

    	const button = new Button({
    			props: {
    				name: /*stationName*/ ctx[4],
    				click: func,
    				buttonType: "stations",
    				checked: /*$selectedStations*/ ctx[0].indexOf(`s${/*i*/ ctx[6] + 1}`) > -1
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const button_changes = {};
    			if (dirty & /*$stationNames*/ 2) button_changes.name = /*stationName*/ ctx[4];
    			if (dirty & /*$selectedStations*/ 1) button_changes.checked = /*$selectedStations*/ ctx[0].indexOf(`s${/*i*/ ctx[6] + 1}`) > -1;
    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(26:2) {#each $stationNames as stationName, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let current;
    	let each_value = /*$stationNames*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "svelte-1dyor2i");
    			add_location(div, file$1, 24, 0, 570);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$stationNames, selectStation, $selectedStations*/ 7) {
    				each_value = /*$stationNames*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $selectedStations;
    	let $stationNames;
    	validate_store(selectedStations, "selectedStations");
    	component_subscribe($$self, selectedStations, $$value => $$invalidate(0, $selectedStations = $$value));
    	validate_store(stationNames, "stationNames");
    	component_subscribe($$self, stationNames, $$value => $$invalidate(1, $stationNames = $$value));

    	function selectStation(station) {
    		const stationIndex = $selectedStations.indexOf(station);

    		if (~stationIndex) {
    			$selectedStations.splice(stationIndex, 1);
    		} else {
    			$selectedStations.push(station);
    			$selectedStations.sort();
    		}

    		selectedStations.set($selectedStations);
    	}

    	const func = i => selectStation(`s${i + 1}`);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("$selectedStations" in $$props) selectedStations.set($selectedStations = $$props.$selectedStations);
    		if ("$stationNames" in $$props) stationNames.set($stationNames = $$props.$stationNames);
    	};

    	return [$selectedStations, $stationNames, selectStation, func];
    }

    class SelectStation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectStation",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const getCalendarPage = (month, year, dayProps) => {
      let date = new Date(year, month, 1);
      date.setDate(date.getDate() - date.getDay());
      let nextMonth = month === 11 ? 0 : month + 1;
      // ensure days starts on Sunday
      // and end on saturday
      let weeks = [];
      while (date.getMonth() !== nextMonth || date.getDay() !== 0 || weeks.length !== 6) {
        if (date.getDay() === 0) weeks.unshift({ days: [], id: `${year}${month}${year}${weeks.length}` });
        const updated = Object.assign({
          partOfMonth: date.getMonth() === month,
          date: new Date(date)
        }, dayProps(date));
        weeks[0].days.push(updated);
        date.setDate(date.getDate() + 1);
      }
      weeks.reverse();
      return { month, year, weeks };
    };

    const getDayPropsHandler = (start, end, selectableCallback) => {
      let today = new Date();
      today.setHours(0, 0, 0, 0);
      return date => ({
        selectable: date >= start && date <= end
         && (!selectableCallback || selectableCallback(date)),
        isToday: date.getTime() === today.getTime()
      });
    };

    function getMonths(start, end, selectableCallback = null) {
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      let endDate = new Date(end.getFullYear(), end.getMonth() + 1, 1);
      let months = [];
      let date = new Date(start.getFullYear(), start.getMonth(), 1);
      let dayPropsHandler = getDayPropsHandler(start, end, selectableCallback);
      while (date < endDate) {
        months.push(getCalendarPage(date.getMonth(), date.getFullYear(), dayPropsHandler));
        date.setMonth(date.getMonth() + 1);
      }
      return months;
    }

    const areDatesEquivalent = (a, b) => a.getDate() === b.getDate()
      && a.getMonth() === b.getMonth()
      && a.getFullYear() === b.getFullYear();

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src\Components\Calendar\Week.svelte generated by Svelte v3.16.0 */
    const file$2 = "src\\Components\\Calendar\\Week.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (22:2) {#each days as day}
    function create_each_block$1(ctx) {
    	let div;
    	let button;
    	let t0_value = /*day*/ ctx[9].date.getDate() + "";
    	let t0;
    	let t1;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[8](/*day*/ ctx[9], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(button, "class", "day--label svelte-5wjnn4");
    			attr_dev(button, "type", "button");
    			toggle_class(button, "selected", areDatesEquivalent(/*day*/ ctx[9].date, /*selected*/ ctx[1]));
    			toggle_class(button, "highlighted", areDatesEquivalent(/*day*/ ctx[9].date, /*highlighted*/ ctx[2]));
    			toggle_class(button, "shake-date", /*shouldShakeDate*/ ctx[3] && areDatesEquivalent(/*day*/ ctx[9].date, /*shouldShakeDate*/ ctx[3]));
    			toggle_class(button, "disabled", !/*day*/ ctx[9].selectable);
    			add_location(button, file$2, 28, 6, 706);
    			attr_dev(div, "class", "day svelte-5wjnn4");
    			toggle_class(div, "outside-month", !/*day*/ ctx[9].partOfMonth);
    			toggle_class(div, "is-today", /*day*/ ctx[9].isToday);
    			toggle_class(div, "is-disabled", !/*day*/ ctx[9].selectable);
    			add_location(div, file$2, 22, 4, 541);
    			dispose = listen_dev(button, "click", click_handler, false, false, false);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, t0);
    			append_dev(div, t1);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*days*/ 1 && t0_value !== (t0_value = /*day*/ ctx[9].date.getDate() + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*areDatesEquivalent, days, selected*/ 3) {
    				toggle_class(button, "selected", areDatesEquivalent(/*day*/ ctx[9].date, /*selected*/ ctx[1]));
    			}

    			if (dirty & /*areDatesEquivalent, days, highlighted*/ 5) {
    				toggle_class(button, "highlighted", areDatesEquivalent(/*day*/ ctx[9].date, /*highlighted*/ ctx[2]));
    			}

    			if (dirty & /*shouldShakeDate, areDatesEquivalent, days*/ 9) {
    				toggle_class(button, "shake-date", /*shouldShakeDate*/ ctx[3] && areDatesEquivalent(/*day*/ ctx[9].date, /*shouldShakeDate*/ ctx[3]));
    			}

    			if (dirty & /*days*/ 1) {
    				toggle_class(button, "disabled", !/*day*/ ctx[9].selectable);
    			}

    			if (dirty & /*days*/ 1) {
    				toggle_class(div, "outside-month", !/*day*/ ctx[9].partOfMonth);
    			}

    			if (dirty & /*days*/ 1) {
    				toggle_class(div, "is-today", /*day*/ ctx[9].isToday);
    			}

    			if (dirty & /*days*/ 1) {
    				toggle_class(div, "is-disabled", !/*day*/ ctx[9].selectable);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(22:2) {#each days as day}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;
    	let each_value = /*days*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "week svelte-5wjnn4");
    			add_location(div, file$2, 16, 0, 395);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*days, areDatesEquivalent, selected, highlighted, shouldShakeDate, dispatch*/ 47) {
    				each_value = /*days*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);

    				if (!div_intro) div_intro = create_in_transition(div, fly, {
    					x: /*direction*/ ctx[4] * 50,
    					duration: 180,
    					delay: 90
    				});

    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fade, { duration: 180 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { days } = $$props;
    	let { selected } = $$props;
    	let { start } = $$props;
    	let { end } = $$props;
    	let { highlighted } = $$props;
    	let { shouldShakeDate } = $$props;
    	let { direction } = $$props;

    	const writable_props = [
    		"days",
    		"selected",
    		"start",
    		"end",
    		"highlighted",
    		"shouldShakeDate",
    		"direction"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Week> was created with unknown prop '${key}'`);
    	});

    	const click_handler = day => dispatch("dateSelected", day.date);

    	$$self.$set = $$props => {
    		if ("days" in $$props) $$invalidate(0, days = $$props.days);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    		if ("start" in $$props) $$invalidate(6, start = $$props.start);
    		if ("end" in $$props) $$invalidate(7, end = $$props.end);
    		if ("highlighted" in $$props) $$invalidate(2, highlighted = $$props.highlighted);
    		if ("shouldShakeDate" in $$props) $$invalidate(3, shouldShakeDate = $$props.shouldShakeDate);
    		if ("direction" in $$props) $$invalidate(4, direction = $$props.direction);
    	};

    	$$self.$capture_state = () => {
    		return {
    			days,
    			selected,
    			start,
    			end,
    			highlighted,
    			shouldShakeDate,
    			direction
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("days" in $$props) $$invalidate(0, days = $$props.days);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    		if ("start" in $$props) $$invalidate(6, start = $$props.start);
    		if ("end" in $$props) $$invalidate(7, end = $$props.end);
    		if ("highlighted" in $$props) $$invalidate(2, highlighted = $$props.highlighted);
    		if ("shouldShakeDate" in $$props) $$invalidate(3, shouldShakeDate = $$props.shouldShakeDate);
    		if ("direction" in $$props) $$invalidate(4, direction = $$props.direction);
    	};

    	return [
    		days,
    		selected,
    		highlighted,
    		shouldShakeDate,
    		direction,
    		dispatch,
    		start,
    		end,
    		click_handler
    	];
    }

    class Week extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			days: 0,
    			selected: 1,
    			start: 6,
    			end: 7,
    			highlighted: 2,
    			shouldShakeDate: 3,
    			direction: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Week",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*days*/ ctx[0] === undefined && !("days" in props)) {
    			console.warn("<Week> was created without expected prop 'days'");
    		}

    		if (/*selected*/ ctx[1] === undefined && !("selected" in props)) {
    			console.warn("<Week> was created without expected prop 'selected'");
    		}

    		if (/*start*/ ctx[6] === undefined && !("start" in props)) {
    			console.warn("<Week> was created without expected prop 'start'");
    		}

    		if (/*end*/ ctx[7] === undefined && !("end" in props)) {
    			console.warn("<Week> was created without expected prop 'end'");
    		}

    		if (/*highlighted*/ ctx[2] === undefined && !("highlighted" in props)) {
    			console.warn("<Week> was created without expected prop 'highlighted'");
    		}

    		if (/*shouldShakeDate*/ ctx[3] === undefined && !("shouldShakeDate" in props)) {
    			console.warn("<Week> was created without expected prop 'shouldShakeDate'");
    		}

    		if (/*direction*/ ctx[4] === undefined && !("direction" in props)) {
    			console.warn("<Week> was created without expected prop 'direction'");
    		}
    	}

    	get days() {
    		throw new Error("<Week>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set days(value) {
    		throw new Error("<Week>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Week>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Week>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get start() {
    		throw new Error("<Week>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set start(value) {
    		throw new Error("<Week>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get end() {
    		throw new Error("<Week>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set end(value) {
    		throw new Error("<Week>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get highlighted() {
    		throw new Error("<Week>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set highlighted(value) {
    		throw new Error("<Week>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shouldShakeDate() {
    		throw new Error("<Week>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shouldShakeDate(value) {
    		throw new Error("<Week>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get direction() {
    		throw new Error("<Week>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set direction(value) {
    		throw new Error("<Week>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Calendar\Month.svelte generated by Svelte v3.16.0 */
    const file$3 = "src\\Components\\Calendar\\Month.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (22:2) {#each visibleMonth.weeks as week (week.id) }
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let current;

    	const week = new Week({
    			props: {
    				days: /*week*/ ctx[10].days,
    				selected: /*selected*/ ctx[1],
    				start: /*start*/ ctx[2],
    				end: /*end*/ ctx[3],
    				highlighted: /*highlighted*/ ctx[4],
    				shouldShakeDate: /*shouldShakeDate*/ ctx[5],
    				direction: /*direction*/ ctx[6]
    			},
    			$$inline: true
    		});

    	week.$on("dateSelected", /*dateSelected_handler*/ ctx[9]);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(week.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(week, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const week_changes = {};
    			if (dirty & /*visibleMonth*/ 1) week_changes.days = /*week*/ ctx[10].days;
    			if (dirty & /*selected*/ 2) week_changes.selected = /*selected*/ ctx[1];
    			if (dirty & /*start*/ 4) week_changes.start = /*start*/ ctx[2];
    			if (dirty & /*end*/ 8) week_changes.end = /*end*/ ctx[3];
    			if (dirty & /*highlighted*/ 16) week_changes.highlighted = /*highlighted*/ ctx[4];
    			if (dirty & /*shouldShakeDate*/ 32) week_changes.shouldShakeDate = /*shouldShakeDate*/ ctx[5];
    			if (dirty & /*direction*/ 64) week_changes.direction = /*direction*/ ctx[6];
    			week.$set(week_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(week.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(week.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(week, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(22:2) {#each visibleMonth.weeks as week (week.id) }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*visibleMonth*/ ctx[0].weeks;
    	const get_key = ctx => /*week*/ ctx[10].id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "month-container svelte-ny3kda");
    			add_location(div, file$3, 20, 0, 322);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const each_value = /*visibleMonth*/ ctx[0].weeks;
    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    			check_outros();
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { id } = $$props;
    	let { visibleMonth } = $$props;
    	let { selected } = $$props;
    	let { start } = $$props;
    	let { end } = $$props;
    	let { highlighted } = $$props;
    	let { shouldShakeDate } = $$props;
    	let lastId = id;
    	let direction;

    	const writable_props = [
    		"id",
    		"visibleMonth",
    		"selected",
    		"start",
    		"end",
    		"highlighted",
    		"shouldShakeDate"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Month> was created with unknown prop '${key}'`);
    	});

    	function dateSelected_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(7, id = $$props.id);
    		if ("visibleMonth" in $$props) $$invalidate(0, visibleMonth = $$props.visibleMonth);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    		if ("start" in $$props) $$invalidate(2, start = $$props.start);
    		if ("end" in $$props) $$invalidate(3, end = $$props.end);
    		if ("highlighted" in $$props) $$invalidate(4, highlighted = $$props.highlighted);
    		if ("shouldShakeDate" in $$props) $$invalidate(5, shouldShakeDate = $$props.shouldShakeDate);
    	};

    	$$self.$capture_state = () => {
    		return {
    			id,
    			visibleMonth,
    			selected,
    			start,
    			end,
    			highlighted,
    			shouldShakeDate,
    			lastId,
    			direction
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(7, id = $$props.id);
    		if ("visibleMonth" in $$props) $$invalidate(0, visibleMonth = $$props.visibleMonth);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    		if ("start" in $$props) $$invalidate(2, start = $$props.start);
    		if ("end" in $$props) $$invalidate(3, end = $$props.end);
    		if ("highlighted" in $$props) $$invalidate(4, highlighted = $$props.highlighted);
    		if ("shouldShakeDate" in $$props) $$invalidate(5, shouldShakeDate = $$props.shouldShakeDate);
    		if ("lastId" in $$props) $$invalidate(8, lastId = $$props.lastId);
    		if ("direction" in $$props) $$invalidate(6, direction = $$props.direction);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*lastId, id*/ 384) {
    			 {
    				$$invalidate(6, direction = lastId < id ? 1 : -1);
    				$$invalidate(8, lastId = id);
    			}
    		}
    	};

    	return [
    		visibleMonth,
    		selected,
    		start,
    		end,
    		highlighted,
    		shouldShakeDate,
    		direction,
    		id,
    		lastId,
    		dateSelected_handler
    	];
    }

    class Month extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			id: 7,
    			visibleMonth: 0,
    			selected: 1,
    			start: 2,
    			end: 3,
    			highlighted: 4,
    			shouldShakeDate: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Month",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*id*/ ctx[7] === undefined && !("id" in props)) {
    			console.warn("<Month> was created without expected prop 'id'");
    		}

    		if (/*visibleMonth*/ ctx[0] === undefined && !("visibleMonth" in props)) {
    			console.warn("<Month> was created without expected prop 'visibleMonth'");
    		}

    		if (/*selected*/ ctx[1] === undefined && !("selected" in props)) {
    			console.warn("<Month> was created without expected prop 'selected'");
    		}

    		if (/*start*/ ctx[2] === undefined && !("start" in props)) {
    			console.warn("<Month> was created without expected prop 'start'");
    		}

    		if (/*end*/ ctx[3] === undefined && !("end" in props)) {
    			console.warn("<Month> was created without expected prop 'end'");
    		}

    		if (/*highlighted*/ ctx[4] === undefined && !("highlighted" in props)) {
    			console.warn("<Month> was created without expected prop 'highlighted'");
    		}

    		if (/*shouldShakeDate*/ ctx[5] === undefined && !("shouldShakeDate" in props)) {
    			console.warn("<Month> was created without expected prop 'shouldShakeDate'");
    		}
    	}

    	get id() {
    		throw new Error("<Month>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Month>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get visibleMonth() {
    		throw new Error("<Month>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visibleMonth(value) {
    		throw new Error("<Month>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Month>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Month>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get start() {
    		throw new Error("<Month>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set start(value) {
    		throw new Error("<Month>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get end() {
    		throw new Error("<Month>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set end(value) {
    		throw new Error("<Month>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get highlighted() {
    		throw new Error("<Month>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set highlighted(value) {
    		throw new Error("<Month>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shouldShakeDate() {
    		throw new Error("<Month>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shouldShakeDate(value) {
    		throw new Error("<Month>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Calendar\NavBar.svelte generated by Svelte v3.16.0 */

    const { Object: Object_1 } = globals;
    const file$4 = "src\\Components\\Calendar\\NavBar.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[17] = i;
    	return child_ctx;
    }

    // (63:4) {#each availableMonths as monthDefinition, index}
    function create_each_block$3(ctx) {
    	let div;
    	let span;
    	let t0_value = /*monthDefinition*/ ctx[15].abbrev + "";
    	let t0;
    	let t1;
    	let dispose;

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[14](/*index*/ ctx[17], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(span, "class", "svelte-1uccyem");
    			add_location(span, file$4, 69, 8, 1956);
    			attr_dev(div, "class", "month-selector--month svelte-1uccyem");
    			toggle_class(div, "selected", /*index*/ ctx[17] === /*month*/ ctx[0]);
    			toggle_class(div, "selectable", /*monthDefinition*/ ctx[15].selectable);
    			add_location(div, file$4, 63, 6, 1746);
    			dispose = listen_dev(div, "click", click_handler_2, false, false, false);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(div, t1);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*availableMonths*/ 64 && t0_value !== (t0_value = /*monthDefinition*/ ctx[15].abbrev + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*month*/ 1) {
    				toggle_class(div, "selected", /*index*/ ctx[17] === /*month*/ ctx[0]);
    			}

    			if (dirty & /*availableMonths*/ 64) {
    				toggle_class(div, "selectable", /*monthDefinition*/ ctx[15].selectable);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(63:4) {#each availableMonths as monthDefinition, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div5;
    	let div3;
    	let div0;
    	let i0;
    	let t0;
    	let div1;
    	let t1_value = /*monthsOfYear*/ ctx[4][/*month*/ ctx[0]][0] + "";
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let div2;
    	let i1;
    	let t5;
    	let div4;
    	let dispose;
    	let each_value = /*availableMonths*/ ctx[6];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			i0 = element("i");
    			t0 = space();
    			div1 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			t3 = text(/*year*/ ctx[1]);
    			t4 = space();
    			div2 = element("div");
    			i1 = element("i");
    			t5 = space();
    			div4 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(i0, "class", "arrow left svelte-1uccyem");
    			add_location(i0, file$4, 50, 6, 1291);
    			attr_dev(div0, "class", "control svelte-1uccyem");
    			toggle_class(div0, "enabled", /*canDecrementMonth*/ ctx[3]);
    			add_location(div0, file$4, 47, 4, 1165);
    			attr_dev(div1, "class", "label svelte-1uccyem");
    			add_location(div1, file$4, 52, 4, 1335);
    			attr_dev(i1, "class", "arrow right svelte-1uccyem");
    			add_location(i1, file$4, 58, 6, 1571);
    			attr_dev(div2, "class", "control svelte-1uccyem");
    			toggle_class(div2, "enabled", /*canIncrementMonth*/ ctx[2]);
    			add_location(div2, file$4, 55, 4, 1447);
    			attr_dev(div3, "class", "heading-section svelte-1uccyem");
    			add_location(div3, file$4, 46, 2, 1130);
    			attr_dev(div4, "class", "month-selector svelte-1uccyem");
    			toggle_class(div4, "open", /*monthSelectorOpen*/ ctx[5]);
    			add_location(div4, file$4, 61, 2, 1624);
    			attr_dev(div5, "class", "title");
    			add_location(div5, file$4, 45, 0, 1107);

    			dispose = [
    				listen_dev(div0, "click", /*click_handler*/ ctx[12], false, false, false),
    				listen_dev(div1, "click", /*toggleMonthSelectorOpen*/ ctx[8], false, false, false),
    				listen_dev(div2, "click", /*click_handler_1*/ ctx[13], false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div3);
    			append_dev(div3, div0);
    			append_dev(div0, i0);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div1, t1);
    			append_dev(div1, t2);
    			append_dev(div1, t3);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, i1);
    			append_dev(div5, t5);
    			append_dev(div5, div4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div4, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*canDecrementMonth*/ 8) {
    				toggle_class(div0, "enabled", /*canDecrementMonth*/ ctx[3]);
    			}

    			if (dirty & /*monthsOfYear, month*/ 17 && t1_value !== (t1_value = /*monthsOfYear*/ ctx[4][/*month*/ ctx[0]][0] + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*year*/ 2) set_data_dev(t3, /*year*/ ctx[1]);

    			if (dirty & /*canIncrementMonth*/ 4) {
    				toggle_class(div2, "enabled", /*canIncrementMonth*/ ctx[2]);
    			}

    			if (dirty & /*month, availableMonths, monthSelected*/ 577) {
    				each_value = /*availableMonths*/ ctx[6];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div4, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*monthSelectorOpen*/ 32) {
    				toggle_class(div4, "open", /*monthSelectorOpen*/ ctx[5]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { month } = $$props;
    	let { start } = $$props;
    	let { end } = $$props;
    	let { year } = $$props;
    	let { canIncrementMonth } = $$props;
    	let { canDecrementMonth } = $$props;
    	let { monthsOfYear } = $$props;
    	let monthSelectorOpen = false;
    	let availableMonths;

    	function toggleMonthSelectorOpen() {
    		$$invalidate(5, monthSelectorOpen = !monthSelectorOpen);
    	}

    	function monthSelected(event, m) {
    		event.stopPropagation();
    		dispatch("monthSelected", m);
    		toggleMonthSelectorOpen();
    	}

    	const writable_props = [
    		"month",
    		"start",
    		"end",
    		"year",
    		"canIncrementMonth",
    		"canDecrementMonth",
    		"monthsOfYear"
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NavBar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("incrementMonth", -1);
    	const click_handler_1 = () => dispatch("incrementMonth", 1);
    	const click_handler_2 = (index, e) => monthSelected(e, index);

    	$$self.$set = $$props => {
    		if ("month" in $$props) $$invalidate(0, month = $$props.month);
    		if ("start" in $$props) $$invalidate(10, start = $$props.start);
    		if ("end" in $$props) $$invalidate(11, end = $$props.end);
    		if ("year" in $$props) $$invalidate(1, year = $$props.year);
    		if ("canIncrementMonth" in $$props) $$invalidate(2, canIncrementMonth = $$props.canIncrementMonth);
    		if ("canDecrementMonth" in $$props) $$invalidate(3, canDecrementMonth = $$props.canDecrementMonth);
    		if ("monthsOfYear" in $$props) $$invalidate(4, monthsOfYear = $$props.monthsOfYear);
    	};

    	$$self.$capture_state = () => {
    		return {
    			month,
    			start,
    			end,
    			year,
    			canIncrementMonth,
    			canDecrementMonth,
    			monthsOfYear,
    			monthSelectorOpen,
    			availableMonths
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("month" in $$props) $$invalidate(0, month = $$props.month);
    		if ("start" in $$props) $$invalidate(10, start = $$props.start);
    		if ("end" in $$props) $$invalidate(11, end = $$props.end);
    		if ("year" in $$props) $$invalidate(1, year = $$props.year);
    		if ("canIncrementMonth" in $$props) $$invalidate(2, canIncrementMonth = $$props.canIncrementMonth);
    		if ("canDecrementMonth" in $$props) $$invalidate(3, canDecrementMonth = $$props.canDecrementMonth);
    		if ("monthsOfYear" in $$props) $$invalidate(4, monthsOfYear = $$props.monthsOfYear);
    		if ("monthSelectorOpen" in $$props) $$invalidate(5, monthSelectorOpen = $$props.monthSelectorOpen);
    		if ("availableMonths" in $$props) $$invalidate(6, availableMonths = $$props.availableMonths);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*start, year, end, monthsOfYear*/ 3090) {
    			 {
    				let isOnLowerBoundary = start.getFullYear() === year;
    				let isOnUpperBoundary = end.getFullYear() === year;

    				$$invalidate(6, availableMonths = monthsOfYear.map((m, i) => {
    					return Object.assign({}, { name: m[0], abbrev: m[1] }, {
    						selectable: !isOnLowerBoundary && !isOnUpperBoundary || (!isOnLowerBoundary || i >= start.getMonth()) && (!isOnUpperBoundary || i <= end.getMonth())
    					});
    				}));
    			}
    		}
    	};

    	return [
    		month,
    		year,
    		canIncrementMonth,
    		canDecrementMonth,
    		monthsOfYear,
    		monthSelectorOpen,
    		availableMonths,
    		dispatch,
    		toggleMonthSelectorOpen,
    		monthSelected,
    		start,
    		end,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class NavBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			month: 0,
    			start: 10,
    			end: 11,
    			year: 1,
    			canIncrementMonth: 2,
    			canDecrementMonth: 3,
    			monthsOfYear: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavBar",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*month*/ ctx[0] === undefined && !("month" in props)) {
    			console.warn("<NavBar> was created without expected prop 'month'");
    		}

    		if (/*start*/ ctx[10] === undefined && !("start" in props)) {
    			console.warn("<NavBar> was created without expected prop 'start'");
    		}

    		if (/*end*/ ctx[11] === undefined && !("end" in props)) {
    			console.warn("<NavBar> was created without expected prop 'end'");
    		}

    		if (/*year*/ ctx[1] === undefined && !("year" in props)) {
    			console.warn("<NavBar> was created without expected prop 'year'");
    		}

    		if (/*canIncrementMonth*/ ctx[2] === undefined && !("canIncrementMonth" in props)) {
    			console.warn("<NavBar> was created without expected prop 'canIncrementMonth'");
    		}

    		if (/*canDecrementMonth*/ ctx[3] === undefined && !("canDecrementMonth" in props)) {
    			console.warn("<NavBar> was created without expected prop 'canDecrementMonth'");
    		}

    		if (/*monthsOfYear*/ ctx[4] === undefined && !("monthsOfYear" in props)) {
    			console.warn("<NavBar> was created without expected prop 'monthsOfYear'");
    		}
    	}

    	get month() {
    		throw new Error("<NavBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set month(value) {
    		throw new Error("<NavBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get start() {
    		throw new Error("<NavBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set start(value) {
    		throw new Error("<NavBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get end() {
    		throw new Error("<NavBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set end(value) {
    		throw new Error("<NavBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get year() {
    		throw new Error("<NavBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set year(value) {
    		throw new Error("<NavBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get canIncrementMonth() {
    		throw new Error("<NavBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set canIncrementMonth(value) {
    		throw new Error("<NavBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get canDecrementMonth() {
    		throw new Error("<NavBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set canDecrementMonth(value) {
    		throw new Error("<NavBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get monthsOfYear() {
    		throw new Error("<NavBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set monthsOfYear(value) {
    		throw new Error("<NavBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Calendar\Popover.svelte generated by Svelte v3.16.0 */

    const { window: window_1 } = globals;
    const file$5 = "src\\Components\\Calendar\\Popover.svelte";
    const get_contents_slot_changes = dirty => ({});
    const get_contents_slot_context = ctx => ({});
    const get_trigger_slot_changes = dirty => ({});
    const get_trigger_slot_context = ctx => ({});

    function create_fragment$5(ctx) {
    	let div4;
    	let div0;
    	let t;
    	let div3;
    	let div2;
    	let div1;
    	let current;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[19]);
    	const trigger_slot_template = /*$$slots*/ ctx[18].trigger;
    	const trigger_slot = create_slot(trigger_slot_template, ctx, /*$$scope*/ ctx[17], get_trigger_slot_context);
    	const contents_slot_template = /*$$slots*/ ctx[18].contents;
    	const contents_slot = create_slot(contents_slot_template, ctx, /*$$scope*/ ctx[17], get_contents_slot_context);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			if (trigger_slot) trigger_slot.c();
    			t = space();
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			if (contents_slot) contents_slot.c();
    			attr_dev(div0, "class", "trigger");
    			add_location(div0, file$5, 102, 2, 2428);
    			attr_dev(div1, "class", "contents-inner svelte-1wmex1c");
    			add_location(div1, file$5, 113, 6, 2825);
    			attr_dev(div2, "class", "contents svelte-1wmex1c");
    			add_location(div2, file$5, 112, 4, 2766);
    			attr_dev(div3, "class", "contents-wrapper svelte-1wmex1c");
    			set_style(div3, "transform", "translate(-50%,-5%) translate(" + /*translateX*/ ctx[8] + "px, " + /*translateY*/ ctx[7] + "px)");
    			toggle_class(div3, "visible", /*open*/ ctx[0]);
    			toggle_class(div3, "shrink", /*shrink*/ ctx[1]);
    			add_location(div3, file$5, 106, 2, 2550);
    			attr_dev(div4, "class", "sc-popover svelte-1wmex1c");
    			add_location(div4, file$5, 101, 0, 2380);

    			dispose = [
    				listen_dev(window_1, "resize", /*onwindowresize*/ ctx[19]),
    				listen_dev(div0, "click", /*doOpen*/ ctx[9], false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);

    			if (trigger_slot) {
    				trigger_slot.m(div0, null);
    			}

    			/*div0_binding*/ ctx[20](div0);
    			append_dev(div4, t);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);

    			if (contents_slot) {
    				contents_slot.m(div1, null);
    			}

    			/*div2_binding*/ ctx[21](div2);
    			/*div3_binding*/ ctx[22](div3);
    			/*div4_binding*/ ctx[23](div4);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (trigger_slot && trigger_slot.p && dirty & /*$$scope*/ 131072) {
    				trigger_slot.p(get_slot_context(trigger_slot_template, ctx, /*$$scope*/ ctx[17], get_trigger_slot_context), get_slot_changes(trigger_slot_template, /*$$scope*/ ctx[17], dirty, get_trigger_slot_changes));
    			}

    			if (contents_slot && contents_slot.p && dirty & /*$$scope*/ 131072) {
    				contents_slot.p(get_slot_context(contents_slot_template, ctx, /*$$scope*/ ctx[17], get_contents_slot_context), get_slot_changes(contents_slot_template, /*$$scope*/ ctx[17], dirty, get_contents_slot_changes));
    			}

    			if (!current || dirty & /*translateX, translateY*/ 384) {
    				set_style(div3, "transform", "translate(-50%,-5%) translate(" + /*translateX*/ ctx[8] + "px, " + /*translateY*/ ctx[7] + "px)");
    			}

    			if (dirty & /*open*/ 1) {
    				toggle_class(div3, "visible", /*open*/ ctx[0]);
    			}

    			if (dirty & /*shrink*/ 2) {
    				toggle_class(div3, "shrink", /*shrink*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(trigger_slot, local);
    			transition_in(contents_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(trigger_slot, local);
    			transition_out(contents_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (trigger_slot) trigger_slot.d(detaching);
    			/*div0_binding*/ ctx[20](null);
    			if (contents_slot) contents_slot.d(detaching);
    			/*div2_binding*/ ctx[21](null);
    			/*div3_binding*/ ctx[22](null);
    			/*div4_binding*/ ctx[23](null);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();

    	let once = (el, evt, cb) => {
    		function handler() {
    			cb.apply(this, arguments);
    			el.removeEventListener(evt, handler);
    		}

    		el.addEventListener(evt, handler);
    	};

    	let popover;
    	let w;
    	let triggerContainer;
    	let contentsAnimated;
    	let contentsWrapper;
    	let translateY = 0;
    	let translateX = 0;
    	let { open = false } = $$props;
    	let { shrink } = $$props;
    	let { trigger } = $$props;

    	const close = () => {
    		$$invalidate(1, shrink = true);

    		once(contentsAnimated, "animationend", () => {
    			$$invalidate(1, shrink = false);
    			$$invalidate(0, open = false);
    			dispatch("closed");
    		});
    	};

    	function checkForFocusLoss(evt) {
    		if (!open) return;
    		let el = evt.target;

    		do {
    			if (el === popover) return;
    		} while (el = el.parentNode);

    		close();
    	}

    	onMount(() => {
    		document.addEventListener("click", checkForFocusLoss);
    		if (!trigger) return;
    		triggerContainer.appendChild(trigger.parentNode.removeChild(trigger));

    		return () => {
    			document.removeEventListener("click", checkForFocusLoss);
    		};
    	});

    	const getDistanceToEdges = async () => {
    		if (!open) {
    			$$invalidate(0, open = true);
    		}

    		await tick();
    		let rect = contentsWrapper.getBoundingClientRect();

    		return {
    			top: rect.top + -1 * translateY,
    			bottom: window.innerHeight - rect.bottom + translateY,
    			left: rect.left + -1 * translateX,
    			right: document.body.clientWidth - rect.right + translateX
    		};
    	};

    	const getTranslate = async () => {
    		let dist = await getDistanceToEdges();
    		let x;
    		let y;

    		if (w < 480) {
    			y = dist.bottom;
    		} else if (dist.top < 0) {
    			y = Math.abs(dist.top);
    		} else if (dist.bottom < 0) {
    			y = dist.bottom;
    		} else {
    			y = 0;
    		}

    		if (dist.left < 0) {
    			x = Math.abs(dist.left);
    		} else if (dist.right < 0) {
    			x = dist.right;
    		} else {
    			x = 0;
    		}

    		return { x, y };
    	};

    	const doOpen = async () => {
    		const { x, y } = await getTranslate();
    		$$invalidate(8, translateX = x);
    		$$invalidate(7, translateY = y);
    		$$invalidate(0, open = true);
    		dispatch("opened");
    	};

    	const writable_props = ["open", "shrink", "trigger"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Popover> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function onwindowresize() {
    		$$invalidate(3, w = window_1.innerWidth);
    	}

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(4, triggerContainer = $$value);
    		});
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(5, contentsAnimated = $$value);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(6, contentsWrapper = $$value);
    		});
    	}

    	function div4_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(2, popover = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("shrink" in $$props) $$invalidate(1, shrink = $$props.shrink);
    		if ("trigger" in $$props) $$invalidate(10, trigger = $$props.trigger);
    		if ("$$scope" in $$props) $$invalidate(17, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {
    			once,
    			popover,
    			w,
    			triggerContainer,
    			contentsAnimated,
    			contentsWrapper,
    			translateY,
    			translateX,
    			open,
    			shrink,
    			trigger
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("once" in $$props) once = $$props.once;
    		if ("popover" in $$props) $$invalidate(2, popover = $$props.popover);
    		if ("w" in $$props) $$invalidate(3, w = $$props.w);
    		if ("triggerContainer" in $$props) $$invalidate(4, triggerContainer = $$props.triggerContainer);
    		if ("contentsAnimated" in $$props) $$invalidate(5, contentsAnimated = $$props.contentsAnimated);
    		if ("contentsWrapper" in $$props) $$invalidate(6, contentsWrapper = $$props.contentsWrapper);
    		if ("translateY" in $$props) $$invalidate(7, translateY = $$props.translateY);
    		if ("translateX" in $$props) $$invalidate(8, translateX = $$props.translateX);
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("shrink" in $$props) $$invalidate(1, shrink = $$props.shrink);
    		if ("trigger" in $$props) $$invalidate(10, trigger = $$props.trigger);
    	};

    	return [
    		open,
    		shrink,
    		popover,
    		w,
    		triggerContainer,
    		contentsAnimated,
    		contentsWrapper,
    		translateY,
    		translateX,
    		doOpen,
    		trigger,
    		close,
    		dispatch,
    		once,
    		checkForFocusLoss,
    		getDistanceToEdges,
    		getTranslate,
    		$$scope,
    		$$slots,
    		onwindowresize,
    		div0_binding,
    		div2_binding,
    		div3_binding,
    		div4_binding
    	];
    }

    class Popover extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			open: 0,
    			shrink: 1,
    			trigger: 10,
    			close: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Popover",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*shrink*/ ctx[1] === undefined && !("shrink" in props)) {
    			console.warn("<Popover> was created without expected prop 'shrink'");
    		}

    		if (/*trigger*/ ctx[10] === undefined && !("trigger" in props)) {
    			console.warn("<Popover> was created without expected prop 'trigger'");
    		}
    	}

    	get open() {
    		throw new Error("<Popover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Popover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shrink() {
    		throw new Error("<Popover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shrink(value) {
    		throw new Error("<Popover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get trigger() {
    		throw new Error("<Popover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set trigger(value) {
    		throw new Error("<Popover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get close() {
    		return this.$$.ctx[11];
    	}

    	set close(value) {
    		throw new Error("<Popover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * generic function to inject data into token-laden string
     * @param str {String} Required
     * @param name {String} Required
     * @param value {String|Integer} Required
     * @returns {String}
     *
     * @example
     * injectStringData("The following is a token: #{tokenName}", "tokenName", 123); 
     * @returns {String} "The following is a token: 123"
     *
     */
    const injectStringData = (str,name,value) => str
      .replace(new RegExp('#{'+name+'}','g'), value);

    /**
     * Generic function to enforce length of string. 
     * 
     * Pass a string or number to this function and specify the desired length.
     * This function will either pad the # with leading 0's (if str.length < length)
     * or remove data from the end (@fromBack==false) or beginning (@fromBack==true)
     * of the string when str.length > length.
     *
     * When length == str.length or typeof length == 'undefined', this function
     * returns the original @str parameter.
     * 
     * @param str {String} Required
     * @param length {Integer} Required
     * @param fromBack {Boolean} Optional
     * @returns {String}
     *
     */
    const enforceLength = function(str,length,fromBack) {
      str = str.toString();
      if(typeof length == 'undefined') return str;
      if(str.length == length) return str;
      fromBack = (typeof fromBack == 'undefined') ? false : fromBack;
      if(str.length < length) {
        // pad the beginning of the string w/ enough 0's to reach desired length:
        while(length - str.length > 0) str = '0' + str;
      } else if(str.length > length) {
        if(fromBack) {
          // grab the desired #/chars from end of string: ex: '2015' -> '15'
          str = str.substring(str.length-length);
        } else {
          // grab the desired #/chars from beginning of string: ex: '2015' -> '20'
          str = str.substring(0,length);
        }
      }
      return str;
    };

    const daysOfWeek = [ 
      [ 'Sunday', 'Sun' ],
      [ 'Monday', 'Mon' ],
      [ 'Tuesday', 'Tue' ],
      [ 'Wednesday', 'Wed' ],
      [ 'Thursday', 'Thu' ],
      [ 'Friday', 'Fri' ],
      [ 'Saturday', 'Sat' ]
    ];

    const monthsOfYear = [ 
      [ 'January', 'Jan' ],
      [ 'February', 'Feb' ],
      [ 'March', 'Mar' ],
      [ 'April', 'Apr' ],
      [ 'May', 'May' ],
      [ 'June', 'Jun' ],
      [ 'July', 'Jul' ],
      [ 'August', 'Aug' ],
      [ 'September', 'Sep' ],
      [ 'October', 'Oct' ],
      [ 'November', 'Nov' ],
      [ 'December', 'Dec' ]
    ];

    let dictionary = { 
      daysOfWeek, 
      monthsOfYear
    };

    const extendDictionary = (conf) => 
      Object.keys(conf).forEach(key => {
        if(dictionary[key] && dictionary[key].length == conf[key].length) {
          dictionary[key] = conf[key];
        }
      });

    var acceptedDateTokens = [
      { 
        // d: day of the month, 2 digits with leading zeros:
        key: 'd', 
        method: function(date) { return enforceLength(date.getDate(), 2); } 
      }, { 
        // D: textual representation of day, 3 letters: Sun thru Sat
        key: 'D', 
        method: function(date) { return dictionary.daysOfWeek[date.getDay()][1]; } 
      }, { 
        // j: day of month without leading 0's
        key: 'j', 
        method: function(date) { return date.getDate(); } 
      }, { 
        // l: full textual representation of day of week: Sunday thru Saturday
        key: 'l', 
        method: function(date) { return dictionary.daysOfWeek[date.getDay()][0]; } 
      }, { 
        // F: full text month: 'January' thru 'December'
        key: 'F', 
        method: function(date) { return dictionary.monthsOfYear[date.getMonth()][0]; } 
      }, { 
        // m: 2 digit numeric month: '01' - '12':
        key: 'm', 
        method: function(date) { return enforceLength(date.getMonth()+1,2); } 
      }, { 
        // M: a short textual representation of the month, 3 letters: 'Jan' - 'Dec'
        key: 'M', 
        method: function(date) { return dictionary.monthsOfYear[date.getMonth()][1]; } 
      }, { 
        // n: numeric represetation of month w/o leading 0's, '1' - '12':
        key: 'n', 
        method: function(date) { return date.getMonth() + 1; } 
      }, { 
        // Y: Full numeric year, 4 digits
        key: 'Y', 
        method: function(date) { return date.getFullYear(); } 
      }, { 
        // y: 2 digit numeric year:
        key: 'y', 
        method: function(date) { return enforceLength(date.getFullYear(),2,true); }
       }
    ];

    var acceptedTimeTokens = [
      { 
        // a: lowercase ante meridiem and post meridiem 'am' or 'pm'
        key: 'a', 
        method: function(date) { return (date.getHours() > 11) ? 'pm' : 'am'; } 
      }, { 
        // A: uppercase ante merdiiem and post meridiem 'AM' or 'PM'
        key: 'A', 
        method: function(date) { return (date.getHours() > 11) ? 'PM' : 'AM'; } 
      }, { 
        // g: 12-hour format of an hour without leading zeros 1-12
        key: 'g', 
        method: function(date) { return date.getHours() % 12 || 12; } 
      }, { 
        // G: 24-hour format of an hour without leading zeros 0-23
        key: 'G', 
        method: function(date) { return date.getHours(); } 
      }, { 
        // h: 12-hour format of an hour with leading zeros 01-12
        key: 'h', 
        method: function(date) { return enforceLength(date.getHours()%12 || 12,2); } 
      }, { 
        // H: 24-hour format of an hour with leading zeros: 00-23
        key: 'H', 
        method: function(date) { return enforceLength(date.getHours(),2); } 
      }, { 
        // i: Minutes with leading zeros 00-59
        key: 'i', 
        method: function(date) { return enforceLength(date.getMinutes(),2); } 
      }, { 
        // s: Seconds with leading zeros 00-59
        key: 's', 
        method: function(date) { return enforceLength(date.getSeconds(),2); }
       }
    ];

    /**
     * Internationalization object for timeUtils.internationalize().
     * @typedef internationalizeObj
     * @property {Array} [daysOfWeek=[ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ]] daysOfWeek Weekday labels as strings, starting with Sunday.
     * @property {Array} [monthsOfYear=[ 'January','February','March','April','May','June','July','August','September','October','November','December' ]] monthsOfYear Month labels as strings, starting with January.
     */

    /**
     * This function can be used to support additional languages by passing an object with 
     * `daysOfWeek` and `monthsOfYear` attributes.  Each attribute should be an array of
     * strings (ex: `daysOfWeek: ['monday', 'tuesday', 'wednesday'...]`)
     *
     * @param {internationalizeObj} conf
     */
    const internationalize = (conf={}) => { 
      extendDictionary(conf);
    };

    /**
     * generic formatDate function which accepts dynamic templates
     * @param date {Date} Required
     * @param template {String} Optional
     * @returns {String}
     *
     * @example
     * formatDate(new Date(), '#{M}. #{j}, #{Y}')
     * @returns {Number} Returns a formatted date
     *
     */
    const formatDate = (date,template='#{m}/#{d}/#{Y}') => {
      acceptedDateTokens.forEach(token => {
        if(template.indexOf(`#{${token.key}}`) == -1) return; 
        template = injectStringData(template,token.key,token.method(date));
      }); 
      acceptedTimeTokens.forEach(token => {
        if(template.indexOf(`#{${token.key}}`) == -1) return;
        template = injectStringData(template,token.key,token.method(date));
      });
      return template;
    };

    const keyCodes = {
      left: 37,
      up: 38,
      right: 39,
      down: 40,
      pgup: 33,
      pgdown: 34,
      enter: 13,
      escape: 27,
      tab: 9
    };

    const keyCodesArray = Object.keys(keyCodes).map(k => keyCodes[k]);

    /* src\Components\Calendar\Datepicker.svelte generated by Svelte v3.16.0 */
    const file$6 = "src\\Components\\Calendar\\Datepicker.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[60] = list[i];
    	return child_ctx;
    }

    // (324:8) {#if !trigger}
    function create_if_block(ctx) {
    	let button;
    	let t;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(/*formattedSelected*/ ctx[2]);
    			attr_dev(button, "class", "calendar-button svelte-ixui4g");
    			attr_dev(button, "type", "button");
    			add_location(button, file$6, 324, 10, 8489);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*formattedSelected*/ 4) set_data_dev(t, /*formattedSelected*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(324:8) {#if !trigger}",
    		ctx
    	});

    	return block;
    }

    // (322:4) <div slot="trigger">
    function create_trigger_slot(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[52].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[59], null);
    	let if_block = !/*trigger*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");

    			if (!default_slot) {
    				if (if_block) if_block.c();
    			}

    			if (default_slot) default_slot.c();
    			attr_dev(div, "slot", "trigger");
    			attr_dev(div, "class", "svelte-ixui4g");
    			add_location(div, file$6, 321, 4, 8419);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!default_slot) {
    				if (if_block) if_block.m(div, null);
    			}

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!default_slot) {
    				if (!/*trigger*/ ctx[1]) {
    					if (if_block) {
    						if_block.p(ctx, dirty);
    					} else {
    						if_block = create_if_block(ctx);
    						if_block.c();
    						if_block.m(div, null);
    					}
    				} else if (if_block) {
    					if_block.d(1);
    					if_block = null;
    				}
    			}

    			if (default_slot && default_slot.p && dirty[1] & /*$$scope*/ 268435456) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[59], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[59], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			if (!default_slot) {
    				if (if_block) if_block.d();
    			}

    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_trigger_slot.name,
    		type: "slot",
    		source: "(322:4) <div slot=\\\"trigger\\\">",
    		ctx
    	});

    	return block;
    }

    // (345:10) {#each sortedDaysOfWeek as day}
    function create_each_block$4(ctx) {
    	let span;
    	let t_value = /*day*/ ctx[60][1] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "svelte-ixui4g");
    			add_location(span, file$6, 345, 12, 9083);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(345:10) {#each sortedDaysOfWeek as day}",
    		ctx
    	});

    	return block;
    }

    // (331:4) <div slot="contents">
    function create_contents_slot(ctx) {
    	let div0;
    	let div2;
    	let t0;
    	let div1;
    	let t1;
    	let current;

    	const navbar = new NavBar({
    			props: {
    				month: /*month*/ ctx[18],
    				year: /*year*/ ctx[19],
    				start: /*start*/ ctx[3],
    				end: /*end*/ ctx[4],
    				canIncrementMonth: /*canIncrementMonth*/ ctx[24],
    				canDecrementMonth: /*canDecrementMonth*/ ctx[25],
    				monthsOfYear: /*monthsOfYear*/ ctx[5]
    			},
    			$$inline: true
    		});

    	navbar.$on("monthSelected", /*monthSelected_handler*/ ctx[53]);
    	navbar.$on("incrementMonth", /*incrementMonth_handler*/ ctx[54]);
    	let each_value = /*sortedDaysOfWeek*/ ctx[26];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const month_1 = new Month({
    			props: {
    				visibleMonth: /*visibleMonth*/ ctx[22],
    				selected: /*selected*/ ctx[0],
    				highlighted: /*highlighted*/ ctx[16],
    				shouldShakeDate: /*shouldShakeDate*/ ctx[17],
    				start: /*start*/ ctx[3],
    				end: /*end*/ ctx[4],
    				id: /*visibleMonthId*/ ctx[23]
    			},
    			$$inline: true
    		});

    	month_1.$on("dateSelected", /*dateSelected_handler*/ ctx[55]);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div2 = element("div");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			create_component(month_1.$$.fragment);
    			attr_dev(div1, "class", "legend svelte-ixui4g");
    			add_location(div1, file$6, 343, 8, 9006);
    			attr_dev(div2, "class", "calendar svelte-ixui4g");
    			add_location(div2, file$6, 331, 6, 8666);
    			attr_dev(div0, "slot", "contents");
    			attr_dev(div0, "class", "svelte-ixui4g");
    			add_location(div0, file$6, 330, 4, 8637);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, div2);
    			mount_component(navbar, div2, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div2, t1);
    			mount_component(month_1, div2, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const navbar_changes = {};
    			if (dirty[0] & /*month*/ 262144) navbar_changes.month = /*month*/ ctx[18];
    			if (dirty[0] & /*year*/ 524288) navbar_changes.year = /*year*/ ctx[19];
    			if (dirty[0] & /*start*/ 8) navbar_changes.start = /*start*/ ctx[3];
    			if (dirty[0] & /*end*/ 16) navbar_changes.end = /*end*/ ctx[4];
    			if (dirty[0] & /*canIncrementMonth*/ 16777216) navbar_changes.canIncrementMonth = /*canIncrementMonth*/ ctx[24];
    			if (dirty[0] & /*canDecrementMonth*/ 33554432) navbar_changes.canDecrementMonth = /*canDecrementMonth*/ ctx[25];
    			if (dirty[0] & /*monthsOfYear*/ 32) navbar_changes.monthsOfYear = /*monthsOfYear*/ ctx[5];
    			navbar.$set(navbar_changes);

    			if (dirty[0] & /*sortedDaysOfWeek*/ 67108864) {
    				each_value = /*sortedDaysOfWeek*/ ctx[26];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const month_1_changes = {};
    			if (dirty[0] & /*visibleMonth*/ 4194304) month_1_changes.visibleMonth = /*visibleMonth*/ ctx[22];
    			if (dirty[0] & /*selected*/ 1) month_1_changes.selected = /*selected*/ ctx[0];
    			if (dirty[0] & /*highlighted*/ 65536) month_1_changes.highlighted = /*highlighted*/ ctx[16];
    			if (dirty[0] & /*shouldShakeDate*/ 131072) month_1_changes.shouldShakeDate = /*shouldShakeDate*/ ctx[17];
    			if (dirty[0] & /*start*/ 8) month_1_changes.start = /*start*/ ctx[3];
    			if (dirty[0] & /*end*/ 16) month_1_changes.end = /*end*/ ctx[4];
    			if (dirty[0] & /*visibleMonthId*/ 8388608) month_1_changes.id = /*visibleMonthId*/ ctx[23];
    			month_1.$set(month_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(month_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(month_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(navbar);
    			destroy_each(each_blocks, detaching);
    			destroy_component(month_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_contents_slot.name,
    		type: "slot",
    		source: "(331:4) <div slot=\\\"contents\\\">",
    		ctx
    	});

    	return block;
    }

    // (314:2) <Popover      bind:this={popover}      bind:open={isOpen}      bind:shrink={isClosing}      {trigger}      on:opened={registerOpen}      on:closed={registerClose}    >
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(314:2) <Popover      bind:this={popover}      bind:open={isOpen}      bind:shrink={isClosing}      {trigger}      on:opened={registerOpen}      on:closed={registerClose}    >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let updating_open;
    	let updating_shrink;
    	let current;

    	function popover_1_open_binding(value) {
    		/*popover_1_open_binding*/ ctx[57].call(null, value);
    	}

    	function popover_1_shrink_binding(value_1) {
    		/*popover_1_shrink_binding*/ ctx[58].call(null, value_1);
    	}

    	let popover_1_props = {
    		trigger: /*trigger*/ ctx[1],
    		$$slots: {
    			default: [create_default_slot],
    			contents: [create_contents_slot],
    			trigger: [create_trigger_slot]
    		},
    		$$scope: { ctx }
    	};

    	if (/*isOpen*/ ctx[20] !== void 0) {
    		popover_1_props.open = /*isOpen*/ ctx[20];
    	}

    	if (/*isClosing*/ ctx[21] !== void 0) {
    		popover_1_props.shrink = /*isClosing*/ ctx[21];
    	}

    	const popover_1 = new Popover({ props: popover_1_props, $$inline: true });
    	/*popover_1_binding*/ ctx[56](popover_1);
    	binding_callbacks.push(() => bind(popover_1, "open", popover_1_open_binding));
    	binding_callbacks.push(() => bind(popover_1, "shrink", popover_1_shrink_binding));
    	popover_1.$on("opened", /*registerOpen*/ ctx[31]);
    	popover_1.$on("closed", /*registerClose*/ ctx[30]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(popover_1.$$.fragment);
    			attr_dev(div, "class", "datepicker svelte-ixui4g");
    			set_style(div, "--button-background-color", /*buttonBackgroundColor*/ ctx[6]);
    			set_style(div, "--button-border-color", /*buttonBorderColor*/ ctx[7]);
    			set_style(div, "--button-text-color", /*buttonTextColor*/ ctx[8]);
    			set_style(div, "--button-font-size", /*buttonFontSize*/ ctx[9]);
    			set_style(div, "--highlight-color", /*highlightColor*/ ctx[10]);
    			set_style(div, "--day-background-color", /*dayBackgroundColor*/ ctx[11]);
    			set_style(div, "--day-text-color", /*dayTextColor*/ ctx[12]);
    			set_style(div, "--day-highlighted-background-color", /*dayHighlightedBackgroundColor*/ ctx[13]);
    			set_style(div, "--day-highlighted-text-color", /*dayHighlightedTextColor*/ ctx[14]);
    			toggle_class(div, "open", /*isOpen*/ ctx[20]);
    			toggle_class(div, "closing", /*isClosing*/ ctx[21]);
    			add_location(div, file$6, 302, 0, 7716);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(popover_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const popover_1_changes = {};
    			if (dirty[0] & /*trigger*/ 2) popover_1_changes.trigger = /*trigger*/ ctx[1];

    			if (dirty[0] & /*visibleMonth, selected, highlighted, shouldShakeDate, start, end, visibleMonthId, month, year, canIncrementMonth, canDecrementMonth, monthsOfYear, trigger, formattedSelected*/ 63897663 | dirty[1] & /*$$scope*/ 268435456) {
    				popover_1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_open && dirty[0] & /*isOpen*/ 1048576) {
    				updating_open = true;
    				popover_1_changes.open = /*isOpen*/ ctx[20];
    				add_flush_callback(() => updating_open = false);
    			}

    			if (!updating_shrink && dirty[0] & /*isClosing*/ 2097152) {
    				updating_shrink = true;
    				popover_1_changes.shrink = /*isClosing*/ ctx[21];
    				add_flush_callback(() => updating_shrink = false);
    			}

    			popover_1.$set(popover_1_changes);

    			if (!current || dirty[0] & /*buttonBackgroundColor*/ 64) {
    				set_style(div, "--button-background-color", /*buttonBackgroundColor*/ ctx[6]);
    			}

    			if (!current || dirty[0] & /*buttonBorderColor*/ 128) {
    				set_style(div, "--button-border-color", /*buttonBorderColor*/ ctx[7]);
    			}

    			if (!current || dirty[0] & /*buttonTextColor*/ 256) {
    				set_style(div, "--button-text-color", /*buttonTextColor*/ ctx[8]);
    			}

    			if (!current || dirty[0] & /*buttonFontSize*/ 512) {
    				set_style(div, "--button-font-size", /*buttonFontSize*/ ctx[9]);
    			}

    			if (!current || dirty[0] & /*highlightColor*/ 1024) {
    				set_style(div, "--highlight-color", /*highlightColor*/ ctx[10]);
    			}

    			if (!current || dirty[0] & /*dayBackgroundColor*/ 2048) {
    				set_style(div, "--day-background-color", /*dayBackgroundColor*/ ctx[11]);
    			}

    			if (!current || dirty[0] & /*dayTextColor*/ 4096) {
    				set_style(div, "--day-text-color", /*dayTextColor*/ ctx[12]);
    			}

    			if (!current || dirty[0] & /*dayHighlightedBackgroundColor*/ 8192) {
    				set_style(div, "--day-highlighted-background-color", /*dayHighlightedBackgroundColor*/ ctx[13]);
    			}

    			if (!current || dirty[0] & /*dayHighlightedTextColor*/ 16384) {
    				set_style(div, "--day-highlighted-text-color", /*dayHighlightedTextColor*/ ctx[14]);
    			}

    			if (dirty[0] & /*isOpen*/ 1048576) {
    				toggle_class(div, "open", /*isOpen*/ ctx[20]);
    			}

    			if (dirty[0] & /*isClosing*/ 2097152) {
    				toggle_class(div, "closing", /*isClosing*/ ctx[21]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(popover_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(popover_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*popover_1_binding*/ ctx[56](null);
    			destroy_component(popover_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getDay(m, date) {
    	for (let i = 0; i < m.weeks.length; i += 1) {
    		for (let j = 0; j < m.weeks[i].days.length; j += 1) {
    			if (areDatesEquivalent(m.weeks[i].days[j].date, date)) {
    				return m.weeks[i].days[j];
    			}
    		}
    	}

    	return null;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	const today = new Date();
    	let popover;
    	let { format = "#{m}/#{d}/#{Y}" } = $$props;
    	let { start = new Date(1987, 9, 29) } = $$props;
    	let { end = new Date(2020, 9, 29) } = $$props;
    	let { selected = today } = $$props;
    	let { dateChosen = false } = $$props;
    	let { trigger = null } = $$props;
    	let { selectableCallback = null } = $$props;
    	let { weekStart = 0 } = $$props;

    	let { daysOfWeek = [
    		["Sunday", "Sun"],
    		["Monday", "Mon"],
    		["Tuesday", "Tue"],
    		["Wednesday", "Wed"],
    		["Thursday", "Thu"],
    		["Friday", "Fri"],
    		["Saturday", "Sat"]
    	] } = $$props;

    	let { monthsOfYear = [
    		["January", "Jan"],
    		["February", "Feb"],
    		["March", "Mar"],
    		["April", "Apr"],
    		["May", "May"],
    		["June", "Jun"],
    		["July", "Jul"],
    		["August", "Aug"],
    		["September", "Sep"],
    		["October", "Oct"],
    		["November", "Nov"],
    		["December", "Dec"]
    	] } = $$props;

    	internationalize({ daysOfWeek, monthsOfYear });

    	let sortedDaysOfWeek = weekStart === 0
    	? daysOfWeek
    	: (() => {
    			let dow = daysOfWeek.slice();
    			dow.push(dow.shift());
    			return dow;
    		})();

    	let highlighted = today;
    	let shouldShakeDate = false;
    	let shakeHighlightTimeout;
    	let month = today.getMonth();
    	let year = today.getFullYear();
    	let isOpen = false;
    	let isClosing = false;
    	today.setHours(0, 0, 0, 0);

    	function assignmentHandler(formatted) {
    		if (!trigger) return;
    		$$invalidate(1, trigger.innerHTML = formatted, trigger);
    	}

    	let monthIndex = 0;
    	let { formattedSelected } = $$props;

    	onMount(() => {
    		$$invalidate(18, month = selected.getMonth());
    		$$invalidate(19, year = selected.getFullYear());
    	});

    	function changeMonth(selectedMonth) {
    		$$invalidate(18, month = selectedMonth);
    	}

    	function incrementMonth(direction, date) {
    		if (direction === 1 && !canIncrementMonth) return;
    		if (direction === -1 && !canDecrementMonth) return;
    		let current = new Date(year, month, 1);
    		current.setMonth(current.getMonth() + direction);
    		$$invalidate(18, month = current.getMonth());
    		$$invalidate(19, year = current.getFullYear());
    		$$invalidate(16, highlighted = new Date(year, month, date || 1));
    	}

    	function getDefaultHighlighted() {
    		return new Date(selected);
    	}

    	function incrementDayHighlighted(amount) {
    		$$invalidate(16, highlighted = new Date(highlighted));
    		highlighted.setDate(highlighted.getDate() + amount);

    		if (amount > 0 && highlighted > lastVisibleDate) {
    			return incrementMonth(1, highlighted.getDate());
    		}

    		if (amount < 0 && highlighted < firstVisibleDate) {
    			return incrementMonth(-1, highlighted.getDate());
    		}

    		return highlighted;
    	}

    	function checkIfVisibleDateIsSelectable(date) {
    		const day = getDay(visibleMonth, date);
    		if (!day) return false;
    		return day.selectable;
    	}

    	function shakeDate(date) {
    		clearTimeout(shakeHighlightTimeout);
    		$$invalidate(17, shouldShakeDate = date);

    		shakeHighlightTimeout = setTimeout(
    			() => {
    				$$invalidate(17, shouldShakeDate = false);
    			},
    			700
    		);
    	}

    	function assignValueToTrigger(formatted) {
    		assignmentHandler(formatted);
    	}

    	function registerSelection(chosen) {
    		if (!checkIfVisibleDateIsSelectable(chosen)) return shakeDate(chosen);
    		close();
    		$$invalidate(0, selected = chosen);
    		$$invalidate(32, dateChosen = true);
    		assignValueToTrigger(formattedSelected);
    		return dispatch("dateSelected", { date: chosen });
    	}

    	function handleKeyPress(evt) {
    		if (keyCodesArray.indexOf(evt.keyCode) === -1) return;
    		evt.preventDefault();

    		switch (evt.keyCode) {
    			case keyCodes.left:
    				incrementDayHighlighted(-1);
    				break;
    			case keyCodes.up:
    				incrementDayHighlighted(-7);
    				break;
    			case keyCodes.right:
    				incrementDayHighlighted(1);
    				break;
    			case keyCodes.down:
    				incrementDayHighlighted(7);
    				break;
    			case keyCodes.pgup:
    				incrementMonth(-1);
    				break;
    			case keyCodes.pgdown:
    				incrementMonth(1);
    				break;
    			case keyCodes.escape:
    				close();
    				break;
    			case keyCodes.enter:
    				registerSelection(highlighted);
    				break;
    		}
    	}

    	function registerClose() {
    		document.removeEventListener("keydown", handleKeyPress);
    		dispatch("close");
    	}

    	function close() {
    		popover.close();
    		registerClose();
    	}

    	function registerOpen() {
    		$$invalidate(16, highlighted = getDefaultHighlighted());
    		$$invalidate(18, month = selected.getMonth());
    		$$invalidate(19, year = selected.getFullYear());
    		document.addEventListener("keydown", handleKeyPress);
    		dispatch("open");
    	}

    	let { buttonBackgroundColor = "#fff" } = $$props;
    	let { buttonBorderColor = "#eee" } = $$props;
    	let { buttonTextColor = "#333" } = $$props;
    	let { buttonFontSize = "inherit" } = $$props;
    	let { highlightColor = "#f7901e" } = $$props;
    	let { dayBackgroundColor = "none" } = $$props;
    	let { dayTextColor = "#4a4a4a" } = $$props;
    	let { dayHighlightedBackgroundColor = "#efefef" } = $$props;
    	let { dayHighlightedTextColor = "#4a4a4a" } = $$props;

    	const writable_props = [
    		"format",
    		"start",
    		"end",
    		"selected",
    		"dateChosen",
    		"trigger",
    		"selectableCallback",
    		"weekStart",
    		"daysOfWeek",
    		"monthsOfYear",
    		"formattedSelected",
    		"buttonBackgroundColor",
    		"buttonBorderColor",
    		"buttonTextColor",
    		"buttonFontSize",
    		"highlightColor",
    		"dayBackgroundColor",
    		"dayTextColor",
    		"dayHighlightedBackgroundColor",
    		"dayHighlightedTextColor"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Datepicker> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	const monthSelected_handler = e => changeMonth(e.detail);
    	const incrementMonth_handler = e => incrementMonth(e.detail);
    	const dateSelected_handler = e => registerSelection(e.detail);

    	function popover_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(15, popover = $$value);
    		});
    	}

    	function popover_1_open_binding(value) {
    		isOpen = value;
    		$$invalidate(20, isOpen);
    	}

    	function popover_1_shrink_binding(value_1) {
    		isClosing = value_1;
    		$$invalidate(21, isClosing);
    	}

    	$$self.$set = $$props => {
    		if ("format" in $$props) $$invalidate(33, format = $$props.format);
    		if ("start" in $$props) $$invalidate(3, start = $$props.start);
    		if ("end" in $$props) $$invalidate(4, end = $$props.end);
    		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
    		if ("dateChosen" in $$props) $$invalidate(32, dateChosen = $$props.dateChosen);
    		if ("trigger" in $$props) $$invalidate(1, trigger = $$props.trigger);
    		if ("selectableCallback" in $$props) $$invalidate(34, selectableCallback = $$props.selectableCallback);
    		if ("weekStart" in $$props) $$invalidate(35, weekStart = $$props.weekStart);
    		if ("daysOfWeek" in $$props) $$invalidate(36, daysOfWeek = $$props.daysOfWeek);
    		if ("monthsOfYear" in $$props) $$invalidate(5, monthsOfYear = $$props.monthsOfYear);
    		if ("formattedSelected" in $$props) $$invalidate(2, formattedSelected = $$props.formattedSelected);
    		if ("buttonBackgroundColor" in $$props) $$invalidate(6, buttonBackgroundColor = $$props.buttonBackgroundColor);
    		if ("buttonBorderColor" in $$props) $$invalidate(7, buttonBorderColor = $$props.buttonBorderColor);
    		if ("buttonTextColor" in $$props) $$invalidate(8, buttonTextColor = $$props.buttonTextColor);
    		if ("buttonFontSize" in $$props) $$invalidate(9, buttonFontSize = $$props.buttonFontSize);
    		if ("highlightColor" in $$props) $$invalidate(10, highlightColor = $$props.highlightColor);
    		if ("dayBackgroundColor" in $$props) $$invalidate(11, dayBackgroundColor = $$props.dayBackgroundColor);
    		if ("dayTextColor" in $$props) $$invalidate(12, dayTextColor = $$props.dayTextColor);
    		if ("dayHighlightedBackgroundColor" in $$props) $$invalidate(13, dayHighlightedBackgroundColor = $$props.dayHighlightedBackgroundColor);
    		if ("dayHighlightedTextColor" in $$props) $$invalidate(14, dayHighlightedTextColor = $$props.dayHighlightedTextColor);
    		if ("$$scope" in $$props) $$invalidate(59, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {
    			popover,
    			format,
    			start,
    			end,
    			selected,
    			dateChosen,
    			trigger,
    			selectableCallback,
    			weekStart,
    			daysOfWeek,
    			monthsOfYear,
    			sortedDaysOfWeek,
    			highlighted,
    			shouldShakeDate,
    			shakeHighlightTimeout,
    			month,
    			year,
    			isOpen,
    			isClosing,
    			monthIndex,
    			formattedSelected,
    			buttonBackgroundColor,
    			buttonBorderColor,
    			buttonTextColor,
    			buttonFontSize,
    			highlightColor,
    			dayBackgroundColor,
    			dayTextColor,
    			dayHighlightedBackgroundColor,
    			dayHighlightedTextColor,
    			months,
    			visibleMonth,
    			visibleMonthId,
    			lastVisibleDate,
    			firstVisibleDate,
    			canIncrementMonth,
    			canDecrementMonth
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("popover" in $$props) $$invalidate(15, popover = $$props.popover);
    		if ("format" in $$props) $$invalidate(33, format = $$props.format);
    		if ("start" in $$props) $$invalidate(3, start = $$props.start);
    		if ("end" in $$props) $$invalidate(4, end = $$props.end);
    		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
    		if ("dateChosen" in $$props) $$invalidate(32, dateChosen = $$props.dateChosen);
    		if ("trigger" in $$props) $$invalidate(1, trigger = $$props.trigger);
    		if ("selectableCallback" in $$props) $$invalidate(34, selectableCallback = $$props.selectableCallback);
    		if ("weekStart" in $$props) $$invalidate(35, weekStart = $$props.weekStart);
    		if ("daysOfWeek" in $$props) $$invalidate(36, daysOfWeek = $$props.daysOfWeek);
    		if ("monthsOfYear" in $$props) $$invalidate(5, monthsOfYear = $$props.monthsOfYear);
    		if ("sortedDaysOfWeek" in $$props) $$invalidate(26, sortedDaysOfWeek = $$props.sortedDaysOfWeek);
    		if ("highlighted" in $$props) $$invalidate(16, highlighted = $$props.highlighted);
    		if ("shouldShakeDate" in $$props) $$invalidate(17, shouldShakeDate = $$props.shouldShakeDate);
    		if ("shakeHighlightTimeout" in $$props) shakeHighlightTimeout = $$props.shakeHighlightTimeout;
    		if ("month" in $$props) $$invalidate(18, month = $$props.month);
    		if ("year" in $$props) $$invalidate(19, year = $$props.year);
    		if ("isOpen" in $$props) $$invalidate(20, isOpen = $$props.isOpen);
    		if ("isClosing" in $$props) $$invalidate(21, isClosing = $$props.isClosing);
    		if ("monthIndex" in $$props) $$invalidate(38, monthIndex = $$props.monthIndex);
    		if ("formattedSelected" in $$props) $$invalidate(2, formattedSelected = $$props.formattedSelected);
    		if ("buttonBackgroundColor" in $$props) $$invalidate(6, buttonBackgroundColor = $$props.buttonBackgroundColor);
    		if ("buttonBorderColor" in $$props) $$invalidate(7, buttonBorderColor = $$props.buttonBorderColor);
    		if ("buttonTextColor" in $$props) $$invalidate(8, buttonTextColor = $$props.buttonTextColor);
    		if ("buttonFontSize" in $$props) $$invalidate(9, buttonFontSize = $$props.buttonFontSize);
    		if ("highlightColor" in $$props) $$invalidate(10, highlightColor = $$props.highlightColor);
    		if ("dayBackgroundColor" in $$props) $$invalidate(11, dayBackgroundColor = $$props.dayBackgroundColor);
    		if ("dayTextColor" in $$props) $$invalidate(12, dayTextColor = $$props.dayTextColor);
    		if ("dayHighlightedBackgroundColor" in $$props) $$invalidate(13, dayHighlightedBackgroundColor = $$props.dayHighlightedBackgroundColor);
    		if ("dayHighlightedTextColor" in $$props) $$invalidate(14, dayHighlightedTextColor = $$props.dayHighlightedTextColor);
    		if ("months" in $$props) $$invalidate(39, months = $$props.months);
    		if ("visibleMonth" in $$props) $$invalidate(22, visibleMonth = $$props.visibleMonth);
    		if ("visibleMonthId" in $$props) $$invalidate(23, visibleMonthId = $$props.visibleMonthId);
    		if ("lastVisibleDate" in $$props) lastVisibleDate = $$props.lastVisibleDate;
    		if ("firstVisibleDate" in $$props) firstVisibleDate = $$props.firstVisibleDate;
    		if ("canIncrementMonth" in $$props) $$invalidate(24, canIncrementMonth = $$props.canIncrementMonth);
    		if ("canDecrementMonth" in $$props) $$invalidate(25, canDecrementMonth = $$props.canDecrementMonth);
    	};

    	let months;
    	let visibleMonth;
    	let visibleMonthId;
    	let lastVisibleDate;
    	let firstVisibleDate;
    	let canIncrementMonth;
    	let canDecrementMonth;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*start, end*/ 24 | $$self.$$.dirty[1] & /*selectableCallback, weekStart*/ 24) {
    			 $$invalidate(39, months = getMonths(start, end, selectableCallback));
    		}

    		if ($$self.$$.dirty[0] & /*month, year*/ 786432 | $$self.$$.dirty[1] & /*months*/ 256) {
    			 {
    				$$invalidate(38, monthIndex = 0);

    				for (let i = 0; i < months.length; i += 1) {
    					if (months[i].month === month && months[i].year === year) {
    						$$invalidate(38, monthIndex = i);
    					}
    				}
    			}
    		}

    		if ($$self.$$.dirty[1] & /*months, monthIndex*/ 384) {
    			 $$invalidate(22, visibleMonth = months[monthIndex]);
    		}

    		if ($$self.$$.dirty[0] & /*year, month*/ 786432) {
    			 $$invalidate(23, visibleMonthId = year + month / 100);
    		}

    		if ($$self.$$.dirty[0] & /*visibleMonth*/ 4194304) {
    			 lastVisibleDate = visibleMonth.weeks[visibleMonth.weeks.length - 1].days[6].date;
    		}

    		if ($$self.$$.dirty[0] & /*visibleMonth*/ 4194304) {
    			 firstVisibleDate = visibleMonth.weeks[0].days[0].date;
    		}

    		if ($$self.$$.dirty[1] & /*monthIndex, months*/ 384) {
    			 $$invalidate(24, canIncrementMonth = monthIndex < months.length - 1);
    		}

    		if ($$self.$$.dirty[1] & /*monthIndex*/ 128) {
    			 $$invalidate(25, canDecrementMonth = monthIndex > 0);
    		}

    		if ($$self.$$.dirty[0] & /*selected*/ 1 | $$self.$$.dirty[1] & /*format*/ 4) {
    			 {
    				$$invalidate(2, formattedSelected = typeof format === "function"
    				? format(selected)
    				: formatDate(selected, format));
    			}
    		}
    	};

    	return [
    		selected,
    		trigger,
    		formattedSelected,
    		start,
    		end,
    		monthsOfYear,
    		buttonBackgroundColor,
    		buttonBorderColor,
    		buttonTextColor,
    		buttonFontSize,
    		highlightColor,
    		dayBackgroundColor,
    		dayTextColor,
    		dayHighlightedBackgroundColor,
    		dayHighlightedTextColor,
    		popover,
    		highlighted,
    		shouldShakeDate,
    		month,
    		year,
    		isOpen,
    		isClosing,
    		visibleMonth,
    		visibleMonthId,
    		canIncrementMonth,
    		canDecrementMonth,
    		sortedDaysOfWeek,
    		changeMonth,
    		incrementMonth,
    		registerSelection,
    		registerClose,
    		registerOpen,
    		dateChosen,
    		format,
    		selectableCallback,
    		weekStart,
    		daysOfWeek,
    		shakeHighlightTimeout,
    		monthIndex,
    		months,
    		lastVisibleDate,
    		firstVisibleDate,
    		dispatch,
    		today,
    		assignmentHandler,
    		getDefaultHighlighted,
    		incrementDayHighlighted,
    		checkIfVisibleDateIsSelectable,
    		shakeDate,
    		assignValueToTrigger,
    		handleKeyPress,
    		close,
    		$$slots,
    		monthSelected_handler,
    		incrementMonth_handler,
    		dateSelected_handler,
    		popover_1_binding,
    		popover_1_open_binding,
    		popover_1_shrink_binding,
    		$$scope
    	];
    }

    class Datepicker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$6,
    			create_fragment$6,
    			safe_not_equal,
    			{
    				format: 33,
    				start: 3,
    				end: 4,
    				selected: 0,
    				dateChosen: 32,
    				trigger: 1,
    				selectableCallback: 34,
    				weekStart: 35,
    				daysOfWeek: 36,
    				monthsOfYear: 5,
    				formattedSelected: 2,
    				buttonBackgroundColor: 6,
    				buttonBorderColor: 7,
    				buttonTextColor: 8,
    				buttonFontSize: 9,
    				highlightColor: 10,
    				dayBackgroundColor: 11,
    				dayTextColor: 12,
    				dayHighlightedBackgroundColor: 13,
    				dayHighlightedTextColor: 14
    			},
    			[-1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Datepicker",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*formattedSelected*/ ctx[2] === undefined && !("formattedSelected" in props)) {
    			console.warn("<Datepicker> was created without expected prop 'formattedSelected'");
    		}
    	}

    	get format() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set format(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get start() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set start(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get end() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set end(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dateChosen() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dateChosen(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get trigger() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set trigger(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectableCallback() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectableCallback(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get weekStart() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set weekStart(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get daysOfWeek() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set daysOfWeek(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get monthsOfYear() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set monthsOfYear(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get formattedSelected() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set formattedSelected(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get buttonBackgroundColor() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set buttonBackgroundColor(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get buttonBorderColor() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set buttonBorderColor(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get buttonTextColor() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set buttonTextColor(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get buttonFontSize() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set buttonFontSize(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get highlightColor() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set highlightColor(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dayBackgroundColor() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dayBackgroundColor(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dayTextColor() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dayTextColor(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dayHighlightedBackgroundColor() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dayHighlightedBackgroundColor(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dayHighlightedTextColor() {
    		throw new Error("<Datepicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dayHighlightedTextColor(value) {
    		throw new Error("<Datepicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\NumberInput.svelte generated by Svelte v3.16.0 */

    const file$7 = "src\\Components\\NumberInput.svelte";

    function create_fragment$7(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "class", "svelte-5pkqnv");
    			add_location(input, file$7, 82, 0, 1625);

    			dispose = [
    				listen_dev(input, "input", /*input_input_handler*/ ctx[11]),
    				listen_dev(input, "input", /*changeInput*/ ctx[3], false, false, false),
    				listen_dev(input, "blur", /*blur*/ ctx[1], false, false, false),
    				listen_dev(input, "focus", /*focus*/ ctx[2], false, false, false),
    				listen_dev(input, "wheel", /*mouseScroll*/ ctx[4], false, false, false),
    				listen_dev(input, "keydown", /*handleKeypress*/ ctx[5], false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { value = 0 } = $$props;
    	let { max = infinity } = $$props;
    	let { min = -infinity } = $$props;
    	let { blur = undefined } = $$props;
    	let { focus = undefined } = $$props;

    	let { scrollChange = () => {
    		
    	} } = $$props;

    	function changeInput(e) {
    		let i = e.target.value.toString();

    		if (i.match(/[^0-9]/g)) {
    			$$invalidate(0, value = i.match(/[0-9]/g).join(""));
    		} else if (Number(i) > max) {
    			$$invalidate(0, value = i.split("").pop());
    		}

    		if (Number(value) > max) {
    			$$invalidate(0, value = max);
    		}

    		$$invalidate(0, value = Number(value));
    	}

    	function decVal() {
    		$$invalidate(0, value--, value);

    		if (value < min) {
    			$$invalidate(0, value = max);
    		}
    	}

    	function incVal() {
    		$$invalidate(0, value++, value);

    		if (value > max) {
    			$$invalidate(0, value = min);
    		}
    	}

    	function mouseScroll(e) {
    		if (e.deltaY > min) {
    			decVal();
    		}

    		if (e.deltaY < 0) {
    			incVal();
    		}

    		scrollChange();
    	}

    	function handleKeypress(e) {
    		switch (e.key) {
    			case "Enter":
    				e.target.blur();
    				break;
    			case "ArrowDown":
    				decVal();
    				break;
    			case "ArrowUp":
    				incVal();
    				break;
    		}
    	}

    	const writable_props = ["value", "max", "min", "blur", "focus", "scrollChange"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NumberInput> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("max" in $$props) $$invalidate(6, max = $$props.max);
    		if ("min" in $$props) $$invalidate(7, min = $$props.min);
    		if ("blur" in $$props) $$invalidate(1, blur = $$props.blur);
    		if ("focus" in $$props) $$invalidate(2, focus = $$props.focus);
    		if ("scrollChange" in $$props) $$invalidate(8, scrollChange = $$props.scrollChange);
    	};

    	$$self.$capture_state = () => {
    		return {
    			value,
    			max,
    			min,
    			blur,
    			focus,
    			scrollChange
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("max" in $$props) $$invalidate(6, max = $$props.max);
    		if ("min" in $$props) $$invalidate(7, min = $$props.min);
    		if ("blur" in $$props) $$invalidate(1, blur = $$props.blur);
    		if ("focus" in $$props) $$invalidate(2, focus = $$props.focus);
    		if ("scrollChange" in $$props) $$invalidate(8, scrollChange = $$props.scrollChange);
    	};

    	return [
    		value,
    		blur,
    		focus,
    		changeInput,
    		mouseScroll,
    		handleKeypress,
    		max,
    		min,
    		scrollChange,
    		decVal,
    		incVal,
    		input_input_handler
    	];
    }

    class NumberInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			value: 0,
    			max: 6,
    			min: 7,
    			blur: 1,
    			focus: 2,
    			scrollChange: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NumberInput",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get value() {
    		throw new Error("<NumberInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<NumberInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<NumberInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<NumberInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get min() {
    		throw new Error("<NumberInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set min(value) {
    		throw new Error("<NumberInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get blur() {
    		throw new Error("<NumberInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set blur(value) {
    		throw new Error("<NumberInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focus() {
    		throw new Error("<NumberInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set focus(value) {
    		throw new Error("<NumberInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrollChange() {
    		throw new Error("<NumberInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scrollChange(value) {
    		throw new Error("<NumberInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\Interval.svelte generated by Svelte v3.16.0 */
    const file$8 = "src\\Components\\Interval.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let span1;
    	let t0;
    	let span0;
    	let updating_value;
    	let t1;
    	let t2;
    	let span3;
    	let t3;
    	let span2;
    	let updating_selected;
    	let current;
    	let dispose;

    	function numberinput_value_binding(value) {
    		/*numberinput_value_binding*/ ctx[10].call(null, value);
    	}

    	let numberinput_props = {
    		max: "365",
    		min: "1",
    		blur: /*saveInterval*/ ctx[4],
    		scrollChange: /*saveInterval*/ ctx[4]
    	};

    	if (/*interval*/ ctx[2] !== void 0) {
    		numberinput_props.value = /*interval*/ ctx[2];
    	}

    	const numberinput = new NumberInput({ props: numberinput_props, $$inline: true });
    	binding_callbacks.push(() => bind(numberinput, "value", numberinput_value_binding));

    	function datepicker_selected_binding(value_1) {
    		/*datepicker_selected_binding*/ ctx[11].call(null, value_1);
    	}

    	let datepicker_props = {
    		format: /*dateFormat*/ ctx[3],
    		start: new Date(),
    		end: oneYearFromNow(),
    		highlightColor: "hsla(200, 65%, 37%, 1)",
    		dayHighlightedBackgroundColor: "hsla(200, 65%, 37%, 1)",
    		dayHighlightedTextColor: "hsla(200, 100%, 98%, 1"
    	};

    	if (/*selectedDate*/ ctx[1] !== void 0) {
    		datepicker_props.selected = /*selectedDate*/ ctx[1];
    	}

    	const datepicker = new Datepicker({ props: datepicker_props, $$inline: true });
    	binding_callbacks.push(() => bind(datepicker, "selected", datepicker_selected_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			span1 = element("span");
    			t0 = text("Run every\r\n    ");
    			span0 = element("span");
    			create_component(numberinput.$$.fragment);
    			t1 = text("\r\n    day(s)");
    			t2 = space();
    			span3 = element("span");
    			t3 = text("starting\r\n    ");
    			span2 = element("span");
    			create_component(datepicker.$$.fragment);
    			attr_dev(span0, "class", "svelte-tok6p0");
    			add_location(span0, file$8, 101, 4, 2241);
    			attr_dev(span1, "class", "svelte-tok6p0");
    			add_location(span1, file$8, 99, 2, 2214);
    			attr_dev(span2, "class", "svelte-tok6p0");
    			add_location(span2, file$8, 115, 4, 2478);
    			attr_dev(span3, "class", "svelte-tok6p0");
    			add_location(span3, file$8, 113, 2, 2452);
    			attr_dev(div, "class", "svelte-tok6p0");
    			toggle_class(div, "active", /*isActive*/ ctx[0] === true);
    			add_location(div, file$8, 98, 0, 2172);
    			dispose = listen_dev(span2, "wheel", /*mouseScroll*/ ctx[5], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span1);
    			append_dev(span1, t0);
    			append_dev(span1, span0);
    			mount_component(numberinput, span0, null);
    			append_dev(span1, t1);
    			append_dev(div, t2);
    			append_dev(div, span3);
    			append_dev(span3, t3);
    			append_dev(span3, span2);
    			mount_component(datepicker, span2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const numberinput_changes = {};

    			if (!updating_value && dirty & /*interval*/ 4) {
    				updating_value = true;
    				numberinput_changes.value = /*interval*/ ctx[2];
    				add_flush_callback(() => updating_value = false);
    			}

    			numberinput.$set(numberinput_changes);
    			const datepicker_changes = {};

    			if (!updating_selected && dirty & /*selectedDate*/ 2) {
    				updating_selected = true;
    				datepicker_changes.selected = /*selectedDate*/ ctx[1];
    				add_flush_callback(() => updating_selected = false);
    			}

    			datepicker.$set(datepicker_changes);

    			if (dirty & /*isActive*/ 1) {
    				toggle_class(div, "active", /*isActive*/ ctx[0] === true);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(numberinput.$$.fragment, local);
    			transition_in(datepicker.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(numberinput.$$.fragment, local);
    			transition_out(datepicker.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(numberinput);
    			destroy_component(datepicker);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function oneYearFromNow() {
    	let now = new Date();
    	let oneYear = new Date(now.setFullYear(now.getFullYear() + 1));
    	return oneYear;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $dateInterval;
    	let $dateStart;
    	validate_store(dateInterval, "dateInterval");
    	component_subscribe($$self, dateInterval, $$value => $$invalidate(7, $dateInterval = $$value));
    	validate_store(dateStart, "dateStart");
    	component_subscribe($$self, dateStart, $$value => $$invalidate(8, $dateStart = $$value));
    	let { isActive = false } = $$props;
    	let selectedDate = new Date($dateStart);
    	let oldDate = new Date(new Date().toLocaleDateString()).getTime();
    	let dateFormat = "#{D} #{M} #{d} #{Y}";

    	function changeInterval(e) {
    		let newInterval = interval;

    		if (!Number(interval)) {
    			newInterval = "";
    		} else if (interval > 365) {
    			newInterval = Number(newInterval.toString().split("").pop());
    		} else {
    			newInterval = interval;
    		}

    		if (newInterval === 0) {
    			newInterval = "";
    		}

    		$$invalidate(2, interval = newInterval);
    	}

    	function saveInterval() {
    		if (!interval) {
    			$$invalidate(2, interval = 1);
    		}

    		set_store_value(dateInterval, $dateInterval = interval * 86400000);
    	}

    	function mouseScroll(e) {
    		if (e.deltaY < 0) {
    			selectedDate.setDate(selectedDate.getDate() + 1);
    			set_store_value(dateStart, $dateStart = new Date(selectedDate.toLocaleDateString()).getTime());
    		}

    		if (e.deltaY > 0) {
    			selectedDate.setDate(selectedDate.getDate() - 1);
    			let today = new Date();

    			if (selectedDate < today) {
    				$$invalidate(1, selectedDate = today);
    			}

    			set_store_value(dateStart, $dateStart = new Date(selectedDate.toLocaleDateString()).getTime());
    		}
    	}

    	const writable_props = ["isActive"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Interval> was created with unknown prop '${key}'`);
    	});

    	function numberinput_value_binding(value) {
    		interval = value;
    		($$invalidate(2, interval), $$invalidate(7, $dateInterval));
    	}

    	function datepicker_selected_binding(value_1) {
    		selectedDate = value_1;
    		(($$invalidate(1, selectedDate), $$invalidate(8, $dateStart)), $$invalidate(6, oldDate));
    	}

    	$$self.$set = $$props => {
    		if ("isActive" in $$props) $$invalidate(0, isActive = $$props.isActive);
    	};

    	$$self.$capture_state = () => {
    		return {
    			isActive,
    			selectedDate,
    			oldDate,
    			dateFormat,
    			interval,
    			$dateInterval,
    			$dateStart
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("isActive" in $$props) $$invalidate(0, isActive = $$props.isActive);
    		if ("selectedDate" in $$props) $$invalidate(1, selectedDate = $$props.selectedDate);
    		if ("oldDate" in $$props) $$invalidate(6, oldDate = $$props.oldDate);
    		if ("dateFormat" in $$props) $$invalidate(3, dateFormat = $$props.dateFormat);
    		if ("interval" in $$props) $$invalidate(2, interval = $$props.interval);
    		if ("$dateInterval" in $$props) dateInterval.set($dateInterval = $$props.$dateInterval);
    		if ("$dateStart" in $$props) dateStart.set($dateStart = $$props.$dateStart);
    	};

    	let interval;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$dateInterval*/ 128) {
    			 $$invalidate(2, interval = Math.floor($dateInterval / 86400000));
    		}

    		if ($$self.$$.dirty & /*$dateStart, oldDate, selectedDate*/ 322) {
    			 {
    				if ($dateStart != oldDate) {
    					$$invalidate(1, selectedDate = new Date($dateStart));
    					$$invalidate(6, oldDate = $dateStart);
    				}

    				set_store_value(dateStart, $dateStart = new Date(selectedDate.toLocaleDateString()).getTime());
    			}
    		}
    	};

    	return [
    		isActive,
    		selectedDate,
    		interval,
    		dateFormat,
    		saveInterval,
    		mouseScroll,
    		oldDate,
    		$dateInterval,
    		$dateStart,
    		changeInterval,
    		numberinput_value_binding,
    		datepicker_selected_binding
    	];
    }

    class Interval extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { isActive: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Interval",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get isActive() {
    		throw new Error("<Interval>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isActive(value) {
    		throw new Error("<Interval>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\DOW.svelte generated by Svelte v3.16.0 */
    const file$9 = "src\\Components\\DOW.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (33:2) {#each days as day, i}
    function create_each_block$5(ctx) {
    	let current;

    	function func(...args) {
    		return /*func*/ ctx[4](/*i*/ ctx[7], ...args);
    	}

    	const button = new Button({
    			props: {
    				name: /*day*/ ctx[5],
    				click: func,
    				buttonType: "dow",
    				checked: /*$dow*/ ctx[1].indexOf(/*i*/ ctx[7]) > -1
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const button_changes = {};
    			if (dirty & /*$dow*/ 2) button_changes.checked = /*$dow*/ ctx[1].indexOf(/*i*/ ctx[7]) > -1;
    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(33:2) {#each days as day, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let current;
    	let each_value = /*days*/ ctx[2];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "svelte-y34ul5");
    			toggle_class(div, "active", /*isActive*/ ctx[0] === true);
    			add_location(div, file$9, 31, 0, 586);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*days, selectDay, $dow*/ 14) {
    				each_value = /*days*/ ctx[2];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*isActive*/ 1) {
    				toggle_class(div, "active", /*isActive*/ ctx[0] === true);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $dow;
    	validate_store(dow, "dow");
    	component_subscribe($$self, dow, $$value => $$invalidate(1, $dow = $$value));
    	let { isActive = false } = $$props;
    	const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "All"];

    	function selectDay(day) {
    		const dayIndex = $dow.indexOf(day);

    		if (dayIndex > -1) {
    			$dow.splice(dayIndex, 1);
    		} else {
    			$dow.push(day);
    			$dow.sort();
    		}

    		dow.set($dow);
    	}

    	const writable_props = ["isActive"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DOW> was created with unknown prop '${key}'`);
    	});

    	const func = i => selectDay(i);

    	$$self.$set = $$props => {
    		if ("isActive" in $$props) $$invalidate(0, isActive = $$props.isActive);
    	};

    	$$self.$capture_state = () => {
    		return { isActive, $dow };
    	};

    	$$self.$inject_state = $$props => {
    		if ("isActive" in $$props) $$invalidate(0, isActive = $$props.isActive);
    		if ("$dow" in $$props) dow.set($dow = $$props.$dow);
    	};

    	return [isActive, $dow, days, selectDay, func];
    }

    class DOW extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { isActive: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DOW",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get isActive() {
    		throw new Error("<DOW>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isActive(value) {
    		throw new Error("<DOW>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\SelectIntervalType.svelte generated by Svelte v3.16.0 */
    const file$a = "src\\Components\\SelectIntervalType.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (28:2) {#each buttonObj as button}
    function create_each_block$6(ctx) {
    	let current;

    	function func(...args) {
    		return /*func*/ ctx[2](/*button*/ ctx[3], ...args);
    	}

    	const button = new Button({
    			props: {
    				name: /*button*/ ctx[3].name,
    				data: /*button*/ ctx[3].data,
    				click: func,
    				buttonType: "interval-type",
    				checked: /*$type*/ ctx[0] === /*button*/ ctx[3].data
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const button_changes = {};
    			if (dirty & /*$type*/ 1) button_changes.click = func;
    			if (dirty & /*$type*/ 1) button_changes.checked = /*$type*/ ctx[0] === /*button*/ ctx[3].data;
    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(28:2) {#each buttonObj as button}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div;
    	let current;
    	let each_value = /*buttonObj*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "svelte-r6lny6");
    			add_location(div, file$a, 26, 0, 459);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*buttonObj, $type*/ 3) {
    				each_value = /*buttonObj*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $type;
    	validate_store(type, "type");
    	component_subscribe($$self, type, $$value => $$invalidate(0, $type = $$value));
    	const buttonObj = [{ name: "Day of Week", data: "dow" }, { name: "Interval", data: "interval" }];
    	const func = button => set_store_value(type, $type = button.data);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("$type" in $$props) type.set($type = $$props.$type);
    	};

    	return [$type, buttonObj, func];
    }

    class SelectIntervalType extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectIntervalType",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\Components\SelectStartStop.svelte generated by Svelte v3.16.0 */
    const file$b = "src\\Components\\SelectStartStop.svelte";

    function create_fragment$b(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let updating_value;
    	let t2;
    	let updating_value_1;
    	let t3;
    	let current;

    	function numberinput0_value_binding(value) {
    		/*numberinput0_value_binding*/ ctx[10].call(null, value);
    	}

    	let numberinput0_props = {
    		max: "12",
    		min: "1",
    		blur: /*setTime*/ ctx[4],
    		scrollChange: /*setTime*/ ctx[4]
    	};

    	if (/*hour*/ ctx[1] !== void 0) {
    		numberinput0_props.value = /*hour*/ ctx[1];
    	}

    	const numberinput0 = new NumberInput({
    			props: numberinput0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(numberinput0, "value", numberinput0_value_binding));

    	function numberinput1_value_binding(value_1) {
    		/*numberinput1_value_binding*/ ctx[11].call(null, value_1);
    	}

    	let numberinput1_props = {
    		max: "59",
    		min: "0",
    		blur: /*setTime*/ ctx[4],
    		scrollChange: /*setTime*/ ctx[4]
    	};

    	if (/*minute*/ ctx[2] !== void 0) {
    		numberinput1_props.value = /*minute*/ ctx[2];
    	}

    	const numberinput1 = new NumberInput({
    			props: numberinput1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(numberinput1, "value", numberinput1_value_binding));

    	const button = new Button({
    			props: {
    				name: /*meridian*/ ctx[3],
    				click: /*handleMeridian*/ ctx[5],
    				buttonType: `meridian ${/*meridian*/ ctx[3]}`
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(/*text*/ ctx[0]);
    			t1 = space();
    			create_component(numberinput0.$$.fragment);
    			t2 = text("\r\n  :\r\n  ");
    			create_component(numberinput1.$$.fragment);
    			t3 = space();
    			create_component(button.$$.fragment);
    			add_location(div, file$b, 50, 0, 1348);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			mount_component(numberinput0, div, null);
    			append_dev(div, t2);
    			mount_component(numberinput1, div, null);
    			append_dev(div, t3);
    			mount_component(button, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*text*/ 1) set_data_dev(t0, /*text*/ ctx[0]);
    			const numberinput0_changes = {};

    			if (!updating_value && dirty & /*hour*/ 2) {
    				updating_value = true;
    				numberinput0_changes.value = /*hour*/ ctx[1];
    				add_flush_callback(() => updating_value = false);
    			}

    			numberinput0.$set(numberinput0_changes);
    			const numberinput1_changes = {};

    			if (!updating_value_1 && dirty & /*minute*/ 4) {
    				updating_value_1 = true;
    				numberinput1_changes.value = /*minute*/ ctx[2];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			numberinput1.$set(numberinput1_changes);
    			const button_changes = {};
    			if (dirty & /*meridian*/ 8) button_changes.name = /*meridian*/ ctx[3];
    			if (dirty & /*meridian*/ 8) button_changes.buttonType = `meridian ${/*meridian*/ ctx[3]}`;
    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(numberinput0.$$.fragment, local);
    			transition_in(numberinput1.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(numberinput0.$$.fragment, local);
    			transition_out(numberinput1.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(numberinput0);
    			destroy_component(numberinput1);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const noon = 43200000;

    function instance$b($$self, $$props, $$invalidate) {
    	let $dailyStart;
    	let $dailyStop;
    	validate_store(dailyStart, "dailyStart");
    	component_subscribe($$self, dailyStart, $$value => $$invalidate(8, $dailyStart = $$value));
    	validate_store(dailyStop, "dailyStop");
    	component_subscribe($$self, dailyStop, $$value => $$invalidate(9, $dailyStop = $$value));
    	let { text = "" } = $$props;
    	let { type = undefined } = $$props;
    	let time = 0;

    	function setTime() {
    		let m = meridian === "pm";
    		$$invalidate(1, hour = hour ? hour : 6);
    		let newTime = (hour === 12 ? 0 : hour) * 3600000 + minute * 60000 + m * 12 * 3600000;

    		if (type === "dailyStart") {
    			set_store_value(dailyStart, $dailyStart = newTime);
    		} else if (type === "dailyStop") {
    			set_store_value(dailyStop, $dailyStop = newTime);
    		}
    	}

    	function handleMeridian() {
    		$$invalidate(3, meridian = meridian === "am" ? "pm" : "am");
    		setTime();
    	}

    	const writable_props = ["text", "type"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SelectStartStop> was created with unknown prop '${key}'`);
    	});

    	function numberinput0_value_binding(value) {
    		hour = value;
    		(((($$invalidate(1, hour), $$invalidate(7, time)), $$invalidate(6, type)), $$invalidate(8, $dailyStart)), $$invalidate(9, $dailyStop));
    	}

    	function numberinput1_value_binding(value_1) {
    		minute = value_1;
    		(((($$invalidate(2, minute), $$invalidate(7, time)), $$invalidate(6, type)), $$invalidate(8, $dailyStart)), $$invalidate(9, $dailyStop));
    	}

    	$$self.$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("type" in $$props) $$invalidate(6, type = $$props.type);
    	};

    	$$self.$capture_state = () => {
    		return {
    			text,
    			type,
    			time,
    			$dailyStart,
    			$dailyStop,
    			hour,
    			minute,
    			meridian
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("type" in $$props) $$invalidate(6, type = $$props.type);
    		if ("time" in $$props) $$invalidate(7, time = $$props.time);
    		if ("$dailyStart" in $$props) dailyStart.set($dailyStart = $$props.$dailyStart);
    		if ("$dailyStop" in $$props) dailyStop.set($dailyStop = $$props.$dailyStop);
    		if ("hour" in $$props) $$invalidate(1, hour = $$props.hour);
    		if ("minute" in $$props) $$invalidate(2, minute = $$props.minute);
    		if ("meridian" in $$props) $$invalidate(3, meridian = $$props.meridian);
    	};

    	let hour;
    	let minute;
    	let meridian;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*type, $dailyStart, $dailyStop*/ 832) {
    			 {
    				if (type === "dailyStart") {
    					$$invalidate(7, time = $dailyStart);
    				} else if (type === "dailyStop") {
    					$$invalidate(7, time = $dailyStop);
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*time*/ 128) {
    			 $$invalidate(1, hour = time < noon
    			? Math.floor(time / 3600000)
    			: Math.floor(time / 3600000) - 12);
    		}

    		if ($$self.$$.dirty & /*hour*/ 2) {
    			 {
    				$$invalidate(1, hour = hour ? hour : 12);
    			}
    		}

    		if ($$self.$$.dirty & /*time*/ 128) {
    			 $$invalidate(2, minute = Math.floor(time % 3600000 / 3600000 * 60));
    		}

    		if ($$self.$$.dirty & /*time*/ 128) {
    			 $$invalidate(3, meridian = time < noon ? "am" : "pm");
    		}

    		if ($$self.$$.dirty & /*minute*/ 4) {
    			 {
    				$$invalidate(2, minute = minute < 10 ? "0" + minute : minute);
    			}
    		}
    	};

    	return [
    		text,
    		hour,
    		minute,
    		meridian,
    		setTime,
    		handleMeridian,
    		type,
    		time,
    		$dailyStart,
    		$dailyStop,
    		numberinput0_value_binding,
    		numberinput1_value_binding
    	];
    }

    class SelectStartStop extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { text: 0, type: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectStartStop",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get text() {
    		throw new Error("<SelectStartStop>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<SelectStartStop>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<SelectStartStop>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<SelectStartStop>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\SelectTimer.svelte generated by Svelte v3.16.0 */
    const file$c = "src\\Components\\SelectTimer.svelte";

    function create_fragment$c(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let updating_value;
    	let t2;
    	let updating_value_1;
    	let t3;
    	let updating_value_2;
    	let t4;
    	let div_class_value;
    	let current;

    	function numberinput0_value_binding(value) {
    		/*numberinput0_value_binding*/ ctx[9].call(null, value);
    	}

    	let numberinput0_props = {
    		max: "23",
    		min: "0",
    		blur: /*setTime*/ ctx[5],
    		scrollChange: /*setTime*/ ctx[5]
    	};

    	if (/*hour*/ ctx[2] !== void 0) {
    		numberinput0_props.value = /*hour*/ ctx[2];
    	}

    	const numberinput0 = new NumberInput({
    			props: numberinput0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(numberinput0, "value", numberinput0_value_binding));

    	function numberinput1_value_binding(value_1) {
    		/*numberinput1_value_binding*/ ctx[10].call(null, value_1);
    	}

    	let numberinput1_props = {
    		max: "59",
    		min: "0",
    		blur: /*setTime*/ ctx[5],
    		scrollChange: /*setTime*/ ctx[5]
    	};

    	if (/*minute*/ ctx[3] !== void 0) {
    		numberinput1_props.value = /*minute*/ ctx[3];
    	}

    	const numberinput1 = new NumberInput({
    			props: numberinput1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(numberinput1, "value", numberinput1_value_binding));

    	function numberinput2_value_binding(value_2) {
    		/*numberinput2_value_binding*/ ctx[11].call(null, value_2);
    	}

    	let numberinput2_props = {
    		max: "59",
    		min: "0",
    		blur: /*setTime*/ ctx[5],
    		scrollChange: /*setTime*/ ctx[5]
    	};

    	if (/*second*/ ctx[4] !== void 0) {
    		numberinput2_props.value = /*second*/ ctx[4];
    	}

    	const numberinput2 = new NumberInput({
    			props: numberinput2_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(numberinput2, "value", numberinput2_value_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(/*text*/ ctx[0]);
    			t1 = space();
    			create_component(numberinput0.$$.fragment);
    			t2 = text("\r\n  hour(s)\r\n  ");
    			create_component(numberinput1.$$.fragment);
    			t3 = text("\r\n  min(s)\r\n  ");
    			create_component(numberinput2.$$.fragment);
    			t4 = text("\r\n  sec(s)");
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*type*/ ctx[1]) + " svelte-ixivud"));
    			add_location(div, file$c, 32, 0, 915);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			mount_component(numberinput0, div, null);
    			append_dev(div, t2);
    			mount_component(numberinput1, div, null);
    			append_dev(div, t3);
    			mount_component(numberinput2, div, null);
    			append_dev(div, t4);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*text*/ 1) set_data_dev(t0, /*text*/ ctx[0]);
    			const numberinput0_changes = {};

    			if (!updating_value && dirty & /*hour*/ 4) {
    				updating_value = true;
    				numberinput0_changes.value = /*hour*/ ctx[2];
    				add_flush_callback(() => updating_value = false);
    			}

    			numberinput0.$set(numberinput0_changes);
    			const numberinput1_changes = {};

    			if (!updating_value_1 && dirty & /*minute*/ 8) {
    				updating_value_1 = true;
    				numberinput1_changes.value = /*minute*/ ctx[3];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			numberinput1.$set(numberinput1_changes);
    			const numberinput2_changes = {};

    			if (!updating_value_2 && dirty & /*second*/ 16) {
    				updating_value_2 = true;
    				numberinput2_changes.value = /*second*/ ctx[4];
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			numberinput2.$set(numberinput2_changes);

    			if (!current || dirty & /*type*/ 2 && div_class_value !== (div_class_value = "" + (null_to_empty(/*type*/ ctx[1]) + " svelte-ixivud"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(numberinput0.$$.fragment, local);
    			transition_in(numberinput1.$$.fragment, local);
    			transition_in(numberinput2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(numberinput0.$$.fragment, local);
    			transition_out(numberinput1.$$.fragment, local);
    			transition_out(numberinput2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(numberinput0);
    			destroy_component(numberinput1);
    			destroy_component(numberinput2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $timerDuration;
    	let $timerInterval;
    	validate_store(timerDuration, "timerDuration");
    	component_subscribe($$self, timerDuration, $$value => $$invalidate(7, $timerDuration = $$value));
    	validate_store(timerInterval, "timerInterval");
    	component_subscribe($$self, timerInterval, $$value => $$invalidate(8, $timerInterval = $$value));
    	let { text = undefined } = $$props;
    	let { type = undefined } = $$props;
    	let time = 0;

    	function setTime() {
    		let newTime = hour * 3600000 + minute * 60000 + second * 1000;

    		if (type === "timerDuration") {
    			set_store_value(timerDuration, $timerDuration = newTime);
    		} else if (type === "timerInterval") {
    			set_store_value(timerInterval, $timerInterval = newTime);
    		}
    	}

    	const writable_props = ["text", "type"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SelectTimer> was created with unknown prop '${key}'`);
    	});

    	function numberinput0_value_binding(value) {
    		hour = value;
    		(((($$invalidate(2, hour), $$invalidate(6, time)), $$invalidate(1, type)), $$invalidate(7, $timerDuration)), $$invalidate(8, $timerInterval));
    	}

    	function numberinput1_value_binding(value_1) {
    		minute = value_1;
    		(((($$invalidate(3, minute), $$invalidate(6, time)), $$invalidate(1, type)), $$invalidate(7, $timerDuration)), $$invalidate(8, $timerInterval));
    	}

    	function numberinput2_value_binding(value_2) {
    		second = value_2;
    		(((($$invalidate(4, second), $$invalidate(6, time)), $$invalidate(1, type)), $$invalidate(7, $timerDuration)), $$invalidate(8, $timerInterval));
    	}

    	$$self.$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    	};

    	$$self.$capture_state = () => {
    		return {
    			text,
    			type,
    			time,
    			$timerDuration,
    			$timerInterval,
    			hour,
    			minute,
    			second
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("time" in $$props) $$invalidate(6, time = $$props.time);
    		if ("$timerDuration" in $$props) timerDuration.set($timerDuration = $$props.$timerDuration);
    		if ("$timerInterval" in $$props) timerInterval.set($timerInterval = $$props.$timerInterval);
    		if ("hour" in $$props) $$invalidate(2, hour = $$props.hour);
    		if ("minute" in $$props) $$invalidate(3, minute = $$props.minute);
    		if ("second" in $$props) $$invalidate(4, second = $$props.second);
    	};

    	let hour;
    	let minute;
    	let second;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*type, $timerDuration, $timerInterval*/ 386) {
    			 {
    				if (type === "timerDuration") {
    					$$invalidate(6, time = $timerDuration);
    				} else if (type === "timerInterval") {
    					$$invalidate(6, time = $timerInterval);
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*time*/ 64) {
    			 $$invalidate(2, hour = Math.floor(time / 3600000));
    		}

    		if ($$self.$$.dirty & /*time*/ 64) {
    			 $$invalidate(3, minute = Math.floor(time % 3600000 / 3600000 * 60));
    		}

    		if ($$self.$$.dirty & /*time*/ 64) {
    			 $$invalidate(4, second = Math.floor(time % 60000 / 1000));
    		}
    	};

    	return [
    		text,
    		type,
    		hour,
    		minute,
    		second,
    		setTime,
    		time,
    		$timerDuration,
    		$timerInterval,
    		numberinput0_value_binding,
    		numberinput1_value_binding,
    		numberinput2_value_binding
    	];
    }

    class SelectTimer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { text: 0, type: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectTimer",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get text() {
    		throw new Error("<SelectTimer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<SelectTimer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<SelectTimer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<SelectTimer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Components\IntervalDOWViewer.svelte generated by Svelte v3.16.0 */
    const file$d = "src\\Components\\IntervalDOWViewer.svelte";

    function create_fragment$d(ctx) {
    	let div;
    	let t;
    	let current;

    	const interval = new Interval({
    			props: {
    				isActive: /*$type*/ ctx[0] === "interval"
    			},
    			$$inline: true
    		});

    	const dow = new DOW({
    			props: { isActive: /*$type*/ ctx[0] === "dow" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(interval.$$.fragment);
    			t = space();
    			create_component(dow.$$.fragment);
    			attr_dev(div, "class", "svelte-1myjy3w");
    			add_location(div, file$d, 13, 0, 221);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(interval, div, null);
    			append_dev(div, t);
    			mount_component(dow, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const interval_changes = {};
    			if (dirty & /*$type*/ 1) interval_changes.isActive = /*$type*/ ctx[0] === "interval";
    			interval.$set(interval_changes);
    			const dow_changes = {};
    			if (dirty & /*$type*/ 1) dow_changes.isActive = /*$type*/ ctx[0] === "dow";
    			dow.$set(dow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(interval.$$.fragment, local);
    			transition_in(dow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(interval.$$.fragment, local);
    			transition_out(dow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(interval);
    			destroy_component(dow);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $type;
    	validate_store(type, "type");
    	component_subscribe($$self, type, $$value => $$invalidate(0, $type = $$value));

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("$type" in $$props) type.set($type = $$props.$type);
    	};

    	return [$type];
    }

    class IntervalDOWViewer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IntervalDOWViewer",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src\Components\SelectProgram.svelte generated by Svelte v3.16.0 */
    const file$e = "src\\Components\\SelectProgram.svelte";

    function create_fragment$e(ctx) {
    	let div;
    	let t0;
    	let span1;
    	let updating_value;
    	let t1;
    	let span0;
    	let t2;
    	let t3_value = /*$programs*/ ctx[0].length + "";
    	let t3;
    	let t4;
    	let current;

    	const button0 = new Button({
    			props: {
    				name: "➤",
    				click: /*decProg*/ ctx[3],
    				buttonType: `program-select left`
    			},
    			$$inline: true
    		});

    	function numberinput_value_binding(value) {
    		/*numberinput_value_binding*/ ctx[18].call(null, value);
    	}

    	let numberinput_props = {
    		max: /*$programs*/ ctx[0].length,
    		min: /*$programs*/ ctx[0].length > 0 ? 1 : 0,
    		scrollChange: /*scrollProgram*/ ctx[2]
    	};

    	if (/*indexDisplay*/ ctx[1] !== void 0) {
    		numberinput_props.value = /*indexDisplay*/ ctx[1];
    	}

    	const numberinput = new NumberInput({ props: numberinput_props, $$inline: true });
    	binding_callbacks.push(() => bind(numberinput, "value", numberinput_value_binding));

    	const button1 = new Button({
    			props: {
    				name: "➤",
    				click: /*incProg*/ ctx[4],
    				buttonType: `program-select right`
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button0.$$.fragment);
    			t0 = space();
    			span1 = element("span");
    			create_component(numberinput.$$.fragment);
    			t1 = space();
    			span0 = element("span");
    			t2 = text("of ");
    			t3 = text(t3_value);
    			t4 = space();
    			create_component(button1.$$.fragment);
    			attr_dev(span0, "class", "svelte-10ubpax");
    			add_location(span0, file$e, 86, 4, 1945);
    			attr_dev(span1, "class", "svelte-10ubpax");
    			add_location(span1, file$e, 79, 2, 1766);
    			attr_dev(div, "class", "svelte-10ubpax");
    			add_location(div, file$e, 77, 0, 1683);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button0, div, null);
    			append_dev(div, t0);
    			append_dev(div, span1);
    			mount_component(numberinput, span1, null);
    			append_dev(span1, t1);
    			append_dev(span1, span0);
    			append_dev(span0, t2);
    			append_dev(span0, t3);
    			append_dev(div, t4);
    			mount_component(button1, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const numberinput_changes = {};
    			if (dirty & /*$programs*/ 1) numberinput_changes.max = /*$programs*/ ctx[0].length;
    			if (dirty & /*$programs*/ 1) numberinput_changes.min = /*$programs*/ ctx[0].length > 0 ? 1 : 0;

    			if (!updating_value && dirty & /*indexDisplay*/ 2) {
    				updating_value = true;
    				numberinput_changes.value = /*indexDisplay*/ ctx[1];
    				add_flush_callback(() => updating_value = false);
    			}

    			numberinput.$set(numberinput_changes);
    			if ((!current || dirty & /*$programs*/ 1) && t3_value !== (t3_value = /*$programs*/ ctx[0].length + "")) set_data_dev(t3, t3_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(numberinput.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(numberinput.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button0);
    			destroy_component(numberinput);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $programIndex;
    	let $programs;
    	let $selectedStations;
    	let $dailyStart;
    	let $dailyStop;
    	let $dateStart;
    	let $dateInterval;
    	let $timerDuration;
    	let $timerInterval;
    	let $type;
    	let $dow;
    	validate_store(programIndex, "programIndex");
    	component_subscribe($$self, programIndex, $$value => $$invalidate(6, $programIndex = $$value));
    	validate_store(programs, "programs");
    	component_subscribe($$self, programs, $$value => $$invalidate(0, $programs = $$value));
    	validate_store(selectedStations, "selectedStations");
    	component_subscribe($$self, selectedStations, $$value => $$invalidate(8, $selectedStations = $$value));
    	validate_store(dailyStart, "dailyStart");
    	component_subscribe($$self, dailyStart, $$value => $$invalidate(9, $dailyStart = $$value));
    	validate_store(dailyStop, "dailyStop");
    	component_subscribe($$self, dailyStop, $$value => $$invalidate(10, $dailyStop = $$value));
    	validate_store(dateStart, "dateStart");
    	component_subscribe($$self, dateStart, $$value => $$invalidate(11, $dateStart = $$value));
    	validate_store(dateInterval, "dateInterval");
    	component_subscribe($$self, dateInterval, $$value => $$invalidate(12, $dateInterval = $$value));
    	validate_store(timerDuration, "timerDuration");
    	component_subscribe($$self, timerDuration, $$value => $$invalidate(13, $timerDuration = $$value));
    	validate_store(timerInterval, "timerInterval");
    	component_subscribe($$self, timerInterval, $$value => $$invalidate(14, $timerInterval = $$value));
    	validate_store(type, "type");
    	component_subscribe($$self, type, $$value => $$invalidate(15, $type = $$value));
    	validate_store(dow, "dow");
    	component_subscribe($$self, dow, $$value => $$invalidate(16, $dow = $$value));

    	function selectProgram() {
    		set_store_value(selectedStations, $selectedStations = [...$programs[index].selectedStations]);
    		set_store_value(dailyStart, $dailyStart = $programs[index].dailyStart);
    		set_store_value(dailyStop, $dailyStop = $programs[index].dailyStop);
    		set_store_value(dateStart, $dateStart = $programs[index].dateStart);
    		set_store_value(dateInterval, $dateInterval = $programs[index].dateInterval);
    		set_store_value(timerDuration, $timerDuration = $programs[index].timerDuration);
    		set_store_value(timerInterval, $timerInterval = $programs[index].timerInterval);
    		set_store_value(type, $type = $programs[index].type);
    		set_store_value(dow, $dow = [...$programs[index].dow]);
    	}

    	function scrollProgram() {
    		set_store_value(programIndex, $programIndex = indexDisplay - 1);
    		selectProgram();
    	}

    	function decProg() {
    		index--;
    		index = index < 0 ? maxIndex - 1 : index;
    		index = index < 0 ? 0 : index;
    		set_store_value(programIndex, $programIndex = index);
    		selectProgram();
    	}

    	function incProg() {
    		index++;
    		index = index > maxIndex - 1 ? 0 : index;
    		set_store_value(programIndex, $programIndex = index);
    		selectProgram();
    	}

    	function numberinput_value_binding(value) {
    		indexDisplay = value;
    		((($$invalidate(1, indexDisplay), $$invalidate(7, maxIndex)), $$invalidate(6, $programIndex)), $$invalidate(0, $programs));
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("index" in $$props) index = $$props.index;
    		if ("$programIndex" in $$props) programIndex.set($programIndex = $$props.$programIndex);
    		if ("maxIndex" in $$props) $$invalidate(7, maxIndex = $$props.maxIndex);
    		if ("$programs" in $$props) programs.set($programs = $$props.$programs);
    		if ("indexDisplay" in $$props) $$invalidate(1, indexDisplay = $$props.indexDisplay);
    		if ("$selectedStations" in $$props) selectedStations.set($selectedStations = $$props.$selectedStations);
    		if ("$dailyStart" in $$props) dailyStart.set($dailyStart = $$props.$dailyStart);
    		if ("$dailyStop" in $$props) dailyStop.set($dailyStop = $$props.$dailyStop);
    		if ("$dateStart" in $$props) dateStart.set($dateStart = $$props.$dateStart);
    		if ("$dateInterval" in $$props) dateInterval.set($dateInterval = $$props.$dateInterval);
    		if ("$timerDuration" in $$props) timerDuration.set($timerDuration = $$props.$timerDuration);
    		if ("$timerInterval" in $$props) timerInterval.set($timerInterval = $$props.$timerInterval);
    		if ("$type" in $$props) type.set($type = $$props.$type);
    		if ("$dow" in $$props) dow.set($dow = $$props.$dow);
    	};

    	let index;
    	let maxIndex;
    	let indexDisplay;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$programIndex*/ 64) {
    			 index = $programIndex;
    		}

    		if ($$self.$$.dirty & /*$programs*/ 1) {
    			 $$invalidate(7, maxIndex = $programs.length);
    		}

    		if ($$self.$$.dirty & /*maxIndex, $programIndex*/ 192) {
    			 $$invalidate(1, indexDisplay = maxIndex > 0 ? $programIndex + 1 : 0);
    		}
    	};

    	return [
    		$programs,
    		indexDisplay,
    		scrollProgram,
    		decProg,
    		incProg,
    		index,
    		$programIndex,
    		maxIndex,
    		$selectedStations,
    		$dailyStart,
    		$dailyStop,
    		$dateStart,
    		$dateInterval,
    		$timerDuration,
    		$timerInterval,
    		$type,
    		$dow,
    		selectProgram,
    		numberinput_value_binding
    	];
    }

    class SelectProgram extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectProgram",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src\Components\ControlButtons.svelte generated by Svelte v3.16.0 */
    const file$f = "src\\Components\\ControlButtons.svelte";

    function create_fragment$f(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let current;

    	const button0 = new Button({
    			props: {
    				name: "ADD",
    				click: /*handleAdd*/ ctx[0],
    				buttonType: `controls add`
    			},
    			$$inline: true
    		});

    	const button1 = new Button({
    			props: {
    				name: "MODIFY",
    				click: /*handleModify*/ ctx[1],
    				buttonType: `controls modify`
    			},
    			$$inline: true
    		});

    	const button2 = new Button({
    			props: {
    				name: "DELETE",
    				click: /*handleDelete*/ ctx[2],
    				buttonType: `controls delete`
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button0.$$.fragment);
    			t0 = space();
    			create_component(button1.$$.fragment);
    			t1 = space();
    			create_component(button2.$$.fragment);
    			attr_dev(div, "class", "svelte-3t3cs6");
    			add_location(div, file$f, 95, 0, 2377);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button0, div, null);
    			append_dev(div, t0);
    			mount_component(button1, div, null);
    			append_dev(div, t1);
    			mount_component(button2, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button0);
    			destroy_component(button1);
    			destroy_component(button2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function postPrograms(p) {
    	window.localStorage.setItem("programs", JSON.stringify(p));
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let $programs;
    	let $selectedStations;
    	let $dailyStart;
    	let $dailyStop;
    	let $dateStart;
    	let $dateInterval;
    	let $timerDuration;
    	let $timerInterval;
    	let $type;
    	let $dow;
    	let $programIndex;
    	validate_store(programs, "programs");
    	component_subscribe($$self, programs, $$value => $$invalidate(3, $programs = $$value));
    	validate_store(selectedStations, "selectedStations");
    	component_subscribe($$self, selectedStations, $$value => $$invalidate(4, $selectedStations = $$value));
    	validate_store(dailyStart, "dailyStart");
    	component_subscribe($$self, dailyStart, $$value => $$invalidate(5, $dailyStart = $$value));
    	validate_store(dailyStop, "dailyStop");
    	component_subscribe($$self, dailyStop, $$value => $$invalidate(6, $dailyStop = $$value));
    	validate_store(dateStart, "dateStart");
    	component_subscribe($$self, dateStart, $$value => $$invalidate(7, $dateStart = $$value));
    	validate_store(dateInterval, "dateInterval");
    	component_subscribe($$self, dateInterval, $$value => $$invalidate(8, $dateInterval = $$value));
    	validate_store(timerDuration, "timerDuration");
    	component_subscribe($$self, timerDuration, $$value => $$invalidate(9, $timerDuration = $$value));
    	validate_store(timerInterval, "timerInterval");
    	component_subscribe($$self, timerInterval, $$value => $$invalidate(10, $timerInterval = $$value));
    	validate_store(type, "type");
    	component_subscribe($$self, type, $$value => $$invalidate(11, $type = $$value));
    	validate_store(dow, "dow");
    	component_subscribe($$self, dow, $$value => $$invalidate(12, $dow = $$value));
    	validate_store(programIndex, "programIndex");
    	component_subscribe($$self, programIndex, $$value => $$invalidate(13, $programIndex = $$value));
    	let _programs = $programs;

    	function currentProgram() {
    		let cp = {
    			selectedStations: [...$selectedStations],
    			dailyStart: $dailyStart,
    			dailyStop: $dailyStop,
    			dateStart: $dateStart,
    			dateInterval: $dateInterval,
    			timerDuration: $timerDuration,
    			timerInterval: $timerInterval,
    			type: $type,
    			dow: [...$dow]
    		};

    		cp.timerOn = cp.dailyStart;
    		cp.timerOff = cp.dailyStart + cp.timerDuration;
    		return cp;
    	}

    	function updateCurrentProgram() {
    		set_store_value(selectedStations, $selectedStations = [...$programs[$programIndex].selectedStations]);
    		set_store_value(dailyStart, $dailyStart = $programs[$programIndex].dailyStart);
    		set_store_value(dailyStop, $dailyStop = $programs[$programIndex].dailyStop);
    		set_store_value(dateStart, $dateStart = $programs[$programIndex].dateStart);
    		set_store_value(dateInterval, $dateInterval = $programs[$programIndex].dateInterval);
    		set_store_value(timerDuration, $timerDuration = $programs[$programIndex].timerDuration);
    		set_store_value(timerInterval, $timerInterval = $programs[$programIndex].timerInterval);
    		set_store_value(type, $type = $programs[$programIndex].type);
    		set_store_value(dow, $dow = [...$programs[$programIndex].dow]);
    		programs.set($programs);
    	}

    	function handleAdd() {
    		$programs.push(currentProgram());
    		set_store_value(programIndex, $programIndex = $programs.length - 1);
    		postPrograms($programs);
    		updateCurrentProgram();
    	}

    	function handleModify() {
    		set_store_value(programs, $programs[$programIndex] = currentProgram(), $programs);
    		postPrograms($programs);
    		updateCurrentProgram();
    	}

    	function handleDelete() {
    		$programs.splice($programIndex, 1);
    		console.log($programIndex);
    		console.log($programs.length - 1);

    		if ($programIndex === $programs.length) {
    			set_store_value(programIndex, $programIndex--, $programIndex);
    		}

    		postPrograms($programs);
    		updateCurrentProgram();
    	}

    	onMount(() => {
    		set_store_value(programs, $programs = JSON.parse(window.localStorage.getItem("programs")) || $programs);
    		updateCurrentProgram();
    	});

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("_programs" in $$props) _programs = $$props._programs;
    		if ("$programs" in $$props) programs.set($programs = $$props.$programs);
    		if ("$selectedStations" in $$props) selectedStations.set($selectedStations = $$props.$selectedStations);
    		if ("$dailyStart" in $$props) dailyStart.set($dailyStart = $$props.$dailyStart);
    		if ("$dailyStop" in $$props) dailyStop.set($dailyStop = $$props.$dailyStop);
    		if ("$dateStart" in $$props) dateStart.set($dateStart = $$props.$dateStart);
    		if ("$dateInterval" in $$props) dateInterval.set($dateInterval = $$props.$dateInterval);
    		if ("$timerDuration" in $$props) timerDuration.set($timerDuration = $$props.$timerDuration);
    		if ("$timerInterval" in $$props) timerInterval.set($timerInterval = $$props.$timerInterval);
    		if ("$type" in $$props) type.set($type = $$props.$type);
    		if ("$dow" in $$props) dow.set($dow = $$props.$dow);
    		if ("$programIndex" in $$props) programIndex.set($programIndex = $$props.$programIndex);
    	};

    	return [handleAdd, handleModify, handleDelete];
    }

    class ControlButtons extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ControlButtons",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src\Components\Tabs.svelte generated by Svelte v3.16.0 */

    const file$g = "src\\Components\\Tabs.svelte";

    function create_fragment$g(ctx) {
    	let div;
    	let button0;
    	let t1;
    	let button1;
    	let t3;
    	let button2;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "Programs";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "Manual";
    			t3 = space();
    			button2 = element("button");
    			button2.textContent = "Config";
    			attr_dev(button0, "class", "svelte-1ebyo2l");
    			toggle_class(button0, "active", /*activeTab*/ ctx[0] === "programs");
    			add_location(button0, file$g, 43, 2, 782);
    			attr_dev(button1, "class", "svelte-1ebyo2l");
    			toggle_class(button1, "active", /*activeTab*/ ctx[0] === "manual");
    			add_location(button1, file$g, 49, 2, 917);
    			attr_dev(button2, "class", "svelte-1ebyo2l");
    			toggle_class(button2, "active", /*activeTab*/ ctx[0] === "config");
    			add_location(button2, file$g, 55, 2, 1046);
    			attr_dev(div, "class", "top-bar svelte-1ebyo2l");
    			add_location(div, file$g, 42, 0, 757);

    			dispose = [
    				listen_dev(button0, "click", /*click_handler*/ ctx[1], false, false, false),
    				listen_dev(button1, "click", /*click_handler_1*/ ctx[2], false, false, false),
    				listen_dev(button2, "click", /*click_handler_2*/ ctx[3], false, false, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(div, t1);
    			append_dev(div, button1);
    			append_dev(div, t3);
    			append_dev(div, button2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*activeTab*/ 1) {
    				toggle_class(button0, "active", /*activeTab*/ ctx[0] === "programs");
    			}

    			if (dirty & /*activeTab*/ 1) {
    				toggle_class(button1, "active", /*activeTab*/ ctx[0] === "manual");
    			}

    			if (dirty & /*activeTab*/ 1) {
    				toggle_class(button2, "active", /*activeTab*/ ctx[0] === "config");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let activeTab = "programs";
    	const click_handler = () => $$invalidate(0, activeTab = "programs");
    	const click_handler_1 = () => $$invalidate(0, activeTab = "manual");
    	const click_handler_2 = () => $$invalidate(0, activeTab = "config");

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("activeTab" in $$props) $$invalidate(0, activeTab = $$props.activeTab);
    	};

    	return [activeTab, click_handler, click_handler_1, click_handler_2];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.16.0 */
    const file$h = "src\\App.svelte";

    function create_fragment$h(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let current;
    	const tabs = new Tabs({ $$inline: true });
    	const selectstation = new SelectStation({ $$inline: true });
    	const selectintervaltype = new SelectIntervalType({ $$inline: true });
    	const intervaldowviewer = new IntervalDOWViewer({ $$inline: true });

    	const selectstartstop0 = new SelectStartStop({
    			props: {
    				text: "Start program at",
    				type: "dailyStart"
    			},
    			$$inline: true
    		});

    	const selectstartstop1 = new SelectStartStop({
    			props: {
    				text: "Stop program at",
    				type: "dailyStop"
    			},
    			$$inline: true
    		});

    	const selecttimer0 = new SelectTimer({
    			props: { text: "Run for", type: "timerDuration" },
    			$$inline: true
    		});

    	const selecttimer1 = new SelectTimer({
    			props: { text: "Every", type: "timerInterval" },
    			$$inline: true
    		});

    	const controlbuttons = new ControlButtons({ $$inline: true });
    	const selectprogram = new SelectProgram({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(tabs.$$.fragment);
    			t0 = space();
    			create_component(selectstation.$$.fragment);
    			t1 = space();
    			create_component(selectintervaltype.$$.fragment);
    			t2 = space();
    			create_component(intervaldowviewer.$$.fragment);
    			t3 = space();
    			create_component(selectstartstop0.$$.fragment);
    			t4 = space();
    			create_component(selectstartstop1.$$.fragment);
    			t5 = space();
    			create_component(selecttimer0.$$.fragment);
    			t6 = space();
    			create_component(selecttimer1.$$.fragment);
    			t7 = space();
    			create_component(controlbuttons.$$.fragment);
    			t8 = space();
    			create_component(selectprogram.$$.fragment);
    			attr_dev(div, "id", "app");
    			attr_dev(div, "class", "svelte-1k4a30");
    			add_location(div, file$h, 82, 0, 1891);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(tabs, div, null);
    			append_dev(div, t0);
    			mount_component(selectstation, div, null);
    			append_dev(div, t1);
    			mount_component(selectintervaltype, div, null);
    			append_dev(div, t2);
    			mount_component(intervaldowviewer, div, null);
    			append_dev(div, t3);
    			mount_component(selectstartstop0, div, null);
    			append_dev(div, t4);
    			mount_component(selectstartstop1, div, null);
    			append_dev(div, t5);
    			mount_component(selecttimer0, div, null);
    			append_dev(div, t6);
    			mount_component(selecttimer1, div, null);
    			append_dev(div, t7);
    			mount_component(controlbuttons, div, null);
    			append_dev(div, t8);
    			mount_component(selectprogram, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs.$$.fragment, local);
    			transition_in(selectstation.$$.fragment, local);
    			transition_in(selectintervaltype.$$.fragment, local);
    			transition_in(intervaldowviewer.$$.fragment, local);
    			transition_in(selectstartstop0.$$.fragment, local);
    			transition_in(selectstartstop1.$$.fragment, local);
    			transition_in(selecttimer0.$$.fragment, local);
    			transition_in(selecttimer1.$$.fragment, local);
    			transition_in(controlbuttons.$$.fragment, local);
    			transition_in(selectprogram.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs.$$.fragment, local);
    			transition_out(selectstation.$$.fragment, local);
    			transition_out(selectintervaltype.$$.fragment, local);
    			transition_out(intervaldowviewer.$$.fragment, local);
    			transition_out(selectstartstop0.$$.fragment, local);
    			transition_out(selectstartstop1.$$.fragment, local);
    			transition_out(selecttimer0.$$.fragment, local);
    			transition_out(selecttimer1.$$.fragment, local);
    			transition_out(controlbuttons.$$.fragment, local);
    			transition_out(selectprogram.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(tabs);
    			destroy_component(selectstation);
    			destroy_component(selectintervaltype);
    			destroy_component(intervaldowviewer);
    			destroy_component(selectstartstop0);
    			destroy_component(selectstartstop1);
    			destroy_component(selecttimer0);
    			destroy_component(selecttimer1);
    			destroy_component(controlbuttons);
    			destroy_component(selectprogram);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    const app = new App({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
