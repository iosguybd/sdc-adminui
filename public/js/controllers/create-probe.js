var BaseView = require('views/base');
var SelectProbeTypeView = require('views/monitoring/select-probe-type');
var SelectMonitorView = require('views/monitoring/select-monitor');

var ProbeConfigViews = {
  'log-scan': require('views/monitoring/config-log-scan'),
  'machine-up': require('views/monitoring/config-machine-up'),
  'http': require('views/monitoring/config-http'),
  'icmp': require('views/monitoring/config-icmp')
};

var Probe = require('models/probe');

var CreateProbeController = BaseView.extend({
  initialize: function(options) {
    _.bindAll(this);

    this.probe = options.probe || new Probe();
    this.vm = options.vm;
    this.showSelectProbeView();
  },

  showSelectProbeView: function() {
    this.selectionView = new SelectProbeTypeView();
    this.selectionView.on('select', this.onSelectProbe);
    this.selectionView.render().$el.modal();
  },

  onSelectProbe: function(p) {
    this.probe.set({type: p});
    this.selectionView.$el.modal('hide');
    this.showProbeConfig(p);
  },

  showProbeConfig: function(p) {
    var ProbeConfigView = (ProbeConfigViews[p]);
    
    this.probeConfigView = new ProbeConfigView({
      vm: this.vm,
      probe: this.probe
    });

    this.probeConfigView.render().$el.modal();
    this.probeConfigView.on('done', this.onDoneProbeConfig);
    this.probeConfigView.focus();
  },


  onDoneProbeConfig: function(cfg) {
    console.log('onDoneProbeConfig', cfg);
    var self = this;
    console.log(this.probe);
    this.probe.set({
      user: this.vm.get('owner_uuid'),
      type: cfg.type,
      name: cfg.name,
      agent: cfg.agent,
      config: cfg.config
    });
    console.log(this.probe);

    this.probe.save({}, {
      success: function() {
        self.probeConfigView.$el.modal('hide');
        self.eventBus.trigger('probe:added', self.probe);
      },
      error: function() {
        alert('Error saving probe');
      }
    });
  }
});


module.exports = CreateProbeController;
