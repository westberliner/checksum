<?php
script('activity', 'admin');
style('activity', 'settings');
/** @var array $_ */
/** @var \OCP\IL10N $l */
?>
<div id="checksum" class="section">
    <h2>Checksum</h2>
    <button><?php p($l->t('Click red button')); ?></button>
    <ul>
        <li>
            <input type="checkbox" <?php echo $_['allowPersonalSettings'] ? 'checked="checked"' : ''; ?> />
        </li>
        <li>Auto Checksum</li>
        <li>Allow/Sort Hash list</li>
</div>
