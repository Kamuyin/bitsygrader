from traitlets.config import get_config

from bitsygrader.config.config import BitsyGraderConfig, LTIConfig, LTISyncTaskConfig, DatabaseConfig, AutogradeConfig

c = get_config()
db_config = DatabaseConfig()
db_config.uri = "sqlite:///bitsygrader.db"
db_config.echo = False
db_config.asset_path = "asset_storage"
c.BitsyGraderConfig.database = db_config

lti = LTIConfig()
lti.enabled = True
lti.lms_url = "http://localhost:7070"
lti.token_url = "http://localhost:7070/mod/lti/token.php"
lti.client_id = "3IC49Kld4TSZyrD"
lti.key_path = "./private.pem"
lti.platform = "moodle"
lti.lti_url = "http://localhost:7070/mod/lti/services.php"
lti.nrps_url = "http://localhost:7070/mod/lti/services.php"

lti.sync_task.enabled = True
lti.sync_task.interval = "1m"
c.BitsyGraderConfig.lti = lti

autograde = AutogradeConfig()
autograde.enabled = True
autograde.cooldown_period = "5m"
autograde.executor_class = "bitsygrader.autograde.executors.SimpleExecutor"
c.BitsyGraderConfig.autograde = autograde